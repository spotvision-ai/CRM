# VM bootstrap

One-time checklist to prepare a fresh Ubuntu 22.04 (or Amazon Linux 2023)
VM for the SPOTVISION Twenty stack. After this, CI/CD drives every
subsequent deploy — you shouldn't need to SSH in except for diagnostics.

## Prerequisites

- EC2 instance with the IAM role from `README.md` step 3 attached.
- Security group allowing `:443` inbound from the world and `:22` from
  your bastion / office IP.
- RDS endpoint reachable from this VM (same VPC + SG rule).
- Domain pointed at the VM's EIP.

## Install Docker + tooling

```bash
# Ubuntu 22.04:
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin \
  docker-compose-plugin awscli amazon-ecr-credential-helper git

sudo usermod -aG docker $USER
newgrp docker   # or log out + back in
```

Wire the ECR credential helper so Docker auto-refreshes the token:

```bash
mkdir -p ~/.docker
cat > ~/.docker/config.json <<EOF
{ "credsStore": "ecr-login" }
EOF
```

Verify:

```bash
docker version      # expect Client + Server
docker compose version
aws sts get-caller-identity   # confirm IAM role is attached
```

## Deploy the compose manifest

The workflow expects the compose file at `/opt/spotvision/twenty/`. The
cleanest way is to check the repo out once and let `git pull` bring
future changes to the manifest alongside image updates.

```bash
sudo mkdir -p /opt/spotvision
sudo chown $USER /opt/spotvision
cd /opt/spotvision
git clone --depth=1 --branch=main \
  https://github.com/spotvision-ai/CRM.git twenty
cd twenty

# Symlink so the compose command stays tidy
ln -sf packages/twenty-docker/docker-compose.prod.spv.yaml docker-compose.prod.spv.yaml
```

Only the compose file is actually needed — `git clone` is just a
convenient delivery mechanism. Pulling `main` on schedule is optional
and will bring future manifest changes.

## Create the `.env`

Copy the template and fill real values:

```bash
cp packages/twenty-docker/.env.prod.spv.example .env
chmod 600 .env
nano .env   # or your editor
```

Minimum required values:

- `ECR_REGISTRY` (account-specific).
- `AWS_REGION`.
- `PG_DATABASE_URL` — writer endpoint of the RDS instance.
- `APP_SECRET` — generate with `openssl rand -hex 32`.
- `SERVER_URL` — public origin.
- `STORAGE_S3_REGION`, `STORAGE_S3_NAME` — the uploads bucket.

## First run

```bash
cd /opt/spotvision/twenty
export TAG=latest   # or a specific version once it's in ECR
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"
docker compose -f docker-compose.prod.spv.yaml pull
docker compose -f docker-compose.prod.spv.yaml up -d
docker compose -f docker-compose.prod.spv.yaml ps
curl -fsS http://localhost:3000/healthz && echo "server OK"
```

If `healthz` doesn't return 200 within ~60 s, check:

```bash
docker compose -f docker-compose.prod.spv.yaml logs --tail=200 server
# or in CloudWatch:
aws logs tail /spotvision/twenty --follow --since 5m
```

## Auto-start on reboot

Drop a systemd unit so the stack survives VM restarts:

```bash
sudo tee /etc/systemd/system/spotvision-twenty.service > /dev/null <<'EOF'
[Unit]
Description=SPOTVISION Twenty stack
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/spotvision/twenty
ExecStart=/usr/bin/docker compose -f docker-compose.prod.spv.yaml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.spv.yaml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable spotvision-twenty.service
```

## Reverse proxy

Out of scope for this doc — assume you front port 3000 with an ALB or
with Caddy/nginx on the VM. Terminate TLS there and forward `/` + `/graphql`
to `http://localhost:3000`. Make sure the proxy preserves WebSocket
upgrades (Twenty uses SSE + subscriptions).

## Troubleshooting the first deploy from CI

If `cd-deploy-spv.yaml` reaches the `deploy` step but fails with
`permission denied` pulling from ECR, the VM's IAM role is missing the
ECR pull permissions — re-check `README.md` step 3. You can verify
manually with:

```bash
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$ECR_REGISTRY"
docker pull "$ECR_REGISTRY/spotvision/twenty:latest"
```
