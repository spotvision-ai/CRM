# SPOTVISION production infra

Single-environment prod for now: a Twenty CRM stack running on one AWS VM
with managed Postgres (RDS) and S3 for uploads. CI/CD builds an image per
semver tag, pushes to a private ECR repo, and SSHes into the VM to roll
the compose stack.

## Topology

```
┌────────────┐  tag push  ┌───────────────┐  OIDC   ┌─────────┐
│  GitHub    │ ─────────► │ GH Actions    │ ───────►│  AWS    │
│  repo      │            │ cd-deploy-spv │         │  IAM    │
└────────────┘            └───────┬───────┘         └────┬────┘
                                  │                      │ sts:AssumeRoleWithWebIdentity
                                  │ docker push          ▼
                                  │                 ┌────────────┐
                                  │                 │  ECR       │
                                  │                 │  spotvision/twenty:<tag>
                                  │                 └────────────┘
                                  │ ssh -i <key>                ▲
                                  ▼                             │ docker pull
                          ┌───────────────┐                     │
                          │  VM (EC2)     │ ────────────────────┘
                          │  docker-      │
                          │  compose up   │ ──► RDS Postgres (writer endpoint)
                          │               │ ──► S3 uploads bucket
                          │  containers:  │
                          │   - server    │
                          │   - worker    │
                          │   - redis     │
                          └───────────────┘
```

## AWS resources (one-time setup)

Create these once per AWS account. Region assumed `us-east-1` — adjust as
needed but keep the VM + RDS + ECR in the same region to avoid cross-region
egress charges.

### 1. ECR repository

```bash
aws ecr create-repository \
  --repository-name spotvision/twenty \
  --image-scanning-configuration scanOnPush=true \
  --region us-east-1
```

Add a lifecycle policy so old images don't accumulate:

```bash
cat > /tmp/ecr-lifecycle.json <<'EOF'
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep the last 20 tagged images + latest",
      "selection": {
        "tagStatus": "tagged",
        "tagPatternList": ["v*", "latest"],
        "countType": "imageCountMoreThan",
        "countNumber": 20
      },
      "action": { "type": "expire" }
    },
    {
      "rulePriority": 2,
      "description": "Drop untagged layers after 7 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
      },
      "action": { "type": "expire" }
    }
  ]
}
EOF

aws ecr put-lifecycle-policy \
  --repository-name spotvision/twenty \
  --lifecycle-policy-text file:///tmp/ecr-lifecycle.json
```

### 2. IAM role for GitHub OIDC (push from CI)

Create `github-deploy-role` with this trust policy so only tag pushes on
our repo can assume it:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike":   { "token.actions.githubusercontent.com:sub": "repo:spotvision-ai/CRM:ref:refs/tags/v*" }
    }
  }]
}
```

Attach an inline policy scoped to the ECR repo:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "ecr:GetAuthorizationToken", "Resource": "*" },
    { "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "arn:aws:ecr:us-east-1:<ACCOUNT_ID>:repository/spotvision/twenty"
    }
  ]
}
```

If the OIDC provider for `token.actions.githubusercontent.com` doesn't
exist yet, follow the AWS docs: *Configuring OpenID Connect in Amazon Web
Services for GitHub Actions*.

### 3. IAM role for the VM (pull from ECR + write CloudWatch logs)

Attach this role to the EC2 instance profile (or to the IAM user whose
access keys run the VM Docker daemon).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "ecr:GetAuthorizationToken", "Resource": "*" },
    { "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": "arn:aws:ecr:us-east-1:<ACCOUNT_ID>:repository/spotvision/twenty"
    },
    { "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:us-east-1:<ACCOUNT_ID>:log-group:/spotvision/twenty*"
    },
    { "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::spotvision-twenty-uploads",
        "arn:aws:s3:::spotvision-twenty-uploads/*"
      ]
    }
  ]
}
```

### 4. RDS (Postgres)

- Engine: Postgres 16 (match the upstream Dockerfile's `postgres:16`).
- DB name: `default` (matches Twenty's conventions).
- Security group: allow inbound 5432 **only from the VM's security group**.
- Enable automatic backups (≥ 7 day retention).

Once provisioned, put the writer endpoint's full URL into
`/opt/spotvision/twenty/.env` as `PG_DATABASE_URL`.

### 5. S3 uploads bucket

- Name: `spotvision-twenty-uploads`.
- Block all public access.
- Server-side encryption: SSE-S3 or SSE-KMS.

## GitHub secrets

Set these in `spotvision-ai/CRM` → Settings → Secrets and variables →
Actions → Repository secrets. Referenced by
`.github/workflows/cd-deploy-spv.yaml`.

| Secret | Example | Source |
|---|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::<ACCOUNT_ID>:role/github-deploy-role` | Step 2 above |
| `AWS_REGION` | `us-east-1` | Your region |
| `AWS_ECR_REGISTRY` | `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com` | `aws ecr describe-registry` |
| `SPV_VM_HOST` | `crm.spotvision.ai` or the EIP | VM public DNS |
| `SPV_VM_USER` | `ubuntu` / `ec2-user` | Matches the AMI |
| `SPV_VM_SSH_KEY` | Private key, full PEM content | From the keypair you SSH with today |
| `SPV_SERVER_URL` | `https://crm.spotvision.ai` | Public origin baked into the frontend |

## Related docs

- `vm-setup.md` — bootstrap checklist for the VM itself.
- `release.md` — how to cut a new release (tag + watch the workflow).
