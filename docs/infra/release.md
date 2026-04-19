# Cutting a release

A release = a semver tag `v<MAJOR>.<MINOR>.<PATCH>` on the branch you want
to ship. Pushing the tag triggers `.github/workflows/cd-deploy-spv.yaml`,
which builds the image, pushes it to ECR, and SSHes into the VM to roll
the compose stack.

## Standard release (feature/fix deploy)

From the branch that's ready to ship (usually `main` after your PR merged):

```bash
git checkout main
git pull --ff-only origin main
git tag v1.2.3
git push origin v1.2.3
```

Watch the run at `https://github.com/spotvision-ai/CRM/actions`. Two jobs:

1. **build-push** — ~8–12 min. Layers are cached in GHA, so subsequent
   releases close to each other build much faster.
2. **deploy** — ~1–2 min. SSH + `docker compose pull + up -d`.

Verify:

```bash
curl -fsS https://crm.spotvision.ai/healthz
# 200 OK with body like {"status":"ok","details":{...}}
```

And check the version bake-in:

```bash
curl -s https://crm.spotvision.ai/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'
```

Logs stream to CloudWatch group `/spotvision/twenty`:

```bash
aws logs tail /spotvision/twenty --follow --since 10m
```

## Rollback

Pick the previous good tag that's still in ECR, then run the workflow
manually with that version as input. No build happens — it just reuses
the image already in ECR.

```bash
# Find the previous tag
aws ecr describe-images \
  --repository-name spotvision/twenty \
  --query 'sort_by(imageDetails,& imagePushedAt)[-5:].imageTags[0]' \
  --output text
```

Then: repo → Actions → **Deploy SPV prod** → *Run workflow* → enter
`v1.2.2` (or whichever) as the version input. Deploy job re-pulls and
re-starts the compose. ~1–2 min back to green.

> Rollback availability assumes the old image is still in ECR. The
> lifecycle policy keeps the last 20 tags, so you effectively have a
> ~20-release window.

## Hotfix workflow

When main is ahead of what's deployed and you need to ship a fix without
pulling in-progress work:

```bash
git checkout v1.2.3       # last deployed tag
git checkout -b hotfix/spv-urgent-fix
# make the minimal change
git commit -am "Hotfix: ..."
git tag v1.2.4
git push origin hotfix/spv-urgent-fix v1.2.4
# later: merge hotfix branch back to main
```

The tag push triggers the deploy immediately. The branch lives as a PR
for review + merge into main afterwards.

## What never to do

- **Don't re-tag**. If `v1.2.3` fails, cut `v1.2.4`. The ECR image for a
  given tag is immutable; overwriting it confuses rollbacks.
- **Don't force-push to `main`**. The tag workflow doesn't care about the
  branch, but `main` force-pushes still destroy other people's work.
- **Don't bypass the `.env` on the VM** by baking secrets into the image.
  The `build-push` job only embeds `APP_VERSION` + `REACT_APP_SERVER_BASE_URL`
  — everything else lives in the `.env` under `/opt/spotvision/twenty/`.
