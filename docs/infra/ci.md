# GitHub Actions policy for the SPOTVISION fork

This fork inherited all 45 workflows from `twentyhq/twenty`. Many of them
only make sense inside the upstream org: they mint a GitHub App token for
`owner: twentyhq`, dispatch into private twentyhq repos, or talk to
twentyhq's Crowdin projects. In this fork they either fail on missing
secrets or fire crons nobody reads.

**Policy: disable them via the Actions API, never by editing or deleting
the files.** Deleting a file upstream still maintains produces a
`deleted by us` conflict on every `twenty/v*` sync; a disabled workflow
costs nothing and survives merges. The trade-off is that the state lives
in GitHub instead of git, which is what this document exists to fix.

Applied on 2026-07-31. Baseline measured over the previous 600 runs:
**551 were `schedule` events from upstream crons**, and `Pull docs
translations from Crowdin` had failed 82 of 170 times.

## Never disable these

| Path | Why |
| --- | --- |
| `.github/workflows/changed-files.yaml` | Reusable (`workflow_call`), invoked by **20 workflows**. Disabling it breaks all of CI. |
| `.github/workflows/discover-apps.yaml` | Reusable, invoked by `ci-server.yaml` (`discover-public-apps`) and `ci-twenty-apps.yaml`. |
| `.github/workflows/cd-deploy-spv.yaml` | The fork's own prod deploy. See `release.md`. |

The 10 composite actions under `.github/actions/` are not workflows and
have no enable/disable state. `yarn-install` and `nx-affected` are used by
nearly every job.

## Active (24)

Kept as-is. The package CI workflows all gate on `changed-files.yaml`, so
they cost nothing on PRs that don't touch their paths — even the ones for
packages this fork never modifies.

- **Deploy**: `cd-deploy-spv`
- **Reusable**: `changed-files`, `discover-apps`, `ci-cross-version-upgrade`
- **Core CI** (packages the fork actually modifies): `ci-server`,
  `ci-front`, `ci-shared`, `ci-ui`
- **Other package CI**: `ci-docs`, `ci-website`, `ci-emails`, `ci-sdk`,
  `ci-zapier`, `ci-codex-plugin`, `ci-create-app`,
  `ci-create-app-e2e-minimal`, `ci-front-component-renderer`,
  `ci-twenty-apps`, `ci-example-app-hello-world`,
  `ci-example-app-postcard`, `ci-test-docker-compose`
- **Cross-cutting**: `ci-e2e-main`, `ci-breaking-changes`, `ci-utils`

## Disabled (21)

### Dispatchers into twentyhq repos (11)

Each mints a GitHub App token from `vars.TWENTY_WORKFLOW_DISPATCHER_CLIENT_ID`
+ `secrets.TWENTY_WORKFLOW_DISPATCHER_PRIVATE_KEY` (neither exists here) and
then runs `gh workflow run --repo twentyhq/...`. They fail at the token step.

| Workflow | Target |
| --- | --- |
| `cd-deploy-main` | `twentyhq/twenty-infra` → `auto-deploy-main.yaml`. Fired on a real push to our `main` and tried to deploy *upstream's* infra. |
| `cd-deploy-tag` | `twentyhq/twenty-infra` → `staging-ci.yaml`. Triggers on `twenty/v*` — exactly the tag name we merge on each sync. |
| `app-prod-parity-e2e-dispatch` | `twentyhq/ci-privileged` |
| `pr-auto-review-dispatch` | `twentyhq/ci-privileged` (`pull_request_target`) |
| `external-contributor-pr-auto-draft` | `twentyhq/ci-privileged` (`pull_request_target`) |
| `post-ci-comments` | `twentyhq/ci-privileged`, posts the `ci-breaking-changes` comment |
| `visual-regression-dispatch` | `twentyhq/ci-privileged`, Argos projects `twenty-front` / `twenty-ui` |
| `preview-env-dispatch` | `twentyhq/ci-public` (`pull_request_target`) |
| `website-preview-dispatch` | `twentyhq/ci-privileged` |
| `ci-ai-catalog-sync` | Opens a PR + `twenty-infra` automerge. Failed 20/20: this repo has `default_workflow_permissions: read`, so Actions cannot create PRs. |
| `ci-dpa-subprocessors-sync` | Syncs from `trust.twenty.com` + `twenty-infra` automerge |

### Crowdin i18n (6)

All six point at twentyhq's Crowdin projects (`1` app, `2` docs, `4`
website) and need `CROWDIN_PERSONAL_TOKEN`. The three `*-pull` workflows
ran on `cron: 0 */2 * * *` each, i.e. 36 runs/day.

`i18n-pull`, `i18n-push`, `docs-i18n-pull`, `docs-i18n-push`,
`website-i18n-pull`, `website-i18n-push`

### Upstream bots, policy and release (4)

| Workflow | Why |
| --- | --- |
| `claude` | Claude Code agent with write permissions; needs `CLAUDE_CODE_OAUTH_TOKEN`, and its `claude-cross-repo` job depends on the twentyhq App. |
| `ci-app-docs-drift` | Needs `CLAUDE_CODE_OAUTH_TOKEN` and **fails the build** on drift in `twenty-docs` pages this fork doesn't maintain. |
| `ci-blocked-contributors` | Enforces upstream's contributor blocklist. |
| `ci-release-create` | Upstream's release flow (committer `github-action-deploy@twenty.com`, labels consumed by twentyhq automation). We release with `v*.*.*` tags + `cd-deploy-spv`. |

## Re-applying (idempotent)

`gh` resolves to `twentyhq/twenty` by default in this checkout because
`upstream` is a remote, so **`-R spotvision-ai/CRM` is mandatory on every
command**.

```bash
WORKFLOWS=(
  cd-deploy-main.yaml
  cd-deploy-tag.yaml
  app-prod-parity-e2e-dispatch.yaml
  pr-auto-review-dispatch.yaml
  external-contributor-pr-auto-draft.yaml
  post-ci-comments.yaml
  visual-regression-dispatch.yaml
  preview-env-dispatch.yaml
  website-preview-dispatch.yaml
  ci-ai-catalog-sync.yaml
  ci-dpa-subprocessors-sync.yaml
  i18n-pull.yaml
  i18n-push.yaml
  docs-i18n-pull.yaml
  docs-i18n-push.yaml
  website-i18n-pull.yaml
  website-i18n-push.yaml
  claude.yml
  ci-app-docs-drift.yaml
  ci-blocked-contributors.yaml
  ci-release-create.yaml
)

for wf in "${WORKFLOWS[@]}"; do
  gh workflow disable "$wf" -R spotvision-ai/CRM
done
```

## After every upstream sync

A sync can add workflows, and **new workflows arrive `active`**. Renamed
files also come back active because the disabled state is keyed by
workflow ID, which follows the path.

```bash
gh api "repos/spotvision-ai/CRM/actions/workflows?per_page=100" \
  --jq '.workflows[] | "\(.state)\t\(.path)"' | sort
```

Expect 21 `disabled_manually` and the rest `active`. Anything new that
references `TWENTY_WORKFLOW_DISPATCHER_*`, `CROWDIN_PERSONAL_TOKEN`,
`CLAUDE_CODE_OAUTH_TOKEN`, or `--repo twentyhq/` goes on the list above:

```bash
grep -rlE 'TWENTY_WORKFLOW_DISPATCHER|CROWDIN_PERSONAL_TOKEN|CLAUDE_CODE_OAUTH_TOKEN|repo twentyhq/' \
  .github/workflows/
```

## Open items

1. **`ci-e2e-main.yaml` leaks fork data to upstream.** Its
   `notify-main-ci-failure` job POSTs our commit SHA, actor and run URL to
   `https://engineering.twenty.com/s/main-ci-failing` with no repository
   guard. It only fires on `push`-triggered failures on `main`. Left active
   for now because it also runs the Playwright e2e suite; disabling the
   whole workflow is the only fix that doesn't edit the file.
2. **Orphaned artifacts.** With `visual-regression-dispatch` and
   `post-ci-comments` off, `ci-front`/`ci-ui` still upload
   `argos-screenshots-*` and `ci-breaking-changes` still uploads
   `breaking-changes-report`, with no consumer. Removing them means editing
   upstream workflow files, against the policy above.
3. **`ci-utils.yaml`** runs Danger.js under `pull_request_target` against
   upstream's Dangerfile (twentyhq PR conventions). Technically works
   (`github.token` only) but it is the highest-privilege surface in the repo
   and validates rules that don't apply to this fork.

## Verified, no action needed

- `main` has **no branch protection**, so the `CODEOWNERS` pointing at 9
  twentyhq handles (none of them `spotvision-ai` members) is inert.
- `.github/dependabot.yml` has `open-pull-requests-limit: 0` on all three
  ecosystems, so it opens no PRs despite the stale `assignees` entry.
- `.github/release-drafter.yml` is orphaned config with no workflow behind
  it: nothing to disable.
- Repo secrets are exactly the 7 the deploy needs (`AWS_*`, `SPV_*`), and
  there are no repo variables. See the secrets table in `README.md`.
