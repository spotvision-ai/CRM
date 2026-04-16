# MERGE_NOTES — SPOTVISION fork divergence log

This file tracks every file in the SPOTVISION private fork that diverges from `twentyhq/twenty` upstream. It exists so that future rebases can be planned instead of discovered mid-conflict.

**Rule**: whenever a commit on the SPOTVISION fork modifies a file that exists in upstream, add (or update) an entry below. If the divergence is net-new (a file we added), you do not need to track it here — git diff against upstream is enough for new files.

**Update discipline**: every PR merging to `main` of the SPOTVISION fork must leave this file coherent with the state of the repo. PR reviewers block merges that touch upstream files without updating this log.

## Entries

| # | Path | Reason for divergence | PR / Fase | Rebase strategy |
|---|---|---|---|---|
| 1 | `packages/twenty-front/index.html` | Rebrand: `<title>Twenty</title>` → `<title>SPOTVISION</title>` | Pre-existing | On conflict, keep SPOTVISION title. Non-semantic line — trivial resolution. |
| 2 | `packages/twenty-shared/src/types/FeatureFlagKey.ts` | Added `IS_ROADMAP_VIEW_ENABLED` for the new Roadmap viewType rollout gate. | feature/roadmap-fase0-spike-spv (Fase 0) | On upstream conflicts, preserve our new enum member; resolve order alphabetically to minimize diff. |
| 3 | `packages/twenty-server/src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util.ts` | Seed the Roadmap feature flag with `value: true` for dev workspaces, so the feature is visible to developers on first boot. | feature/roadmap-fase0-spike-spv (Fase 0) | On conflict, keep our seed entry at the end of the values list. |
| 4 | `packages/twenty-server/src/engine/twenty-orm/entity-manager/workspace-entity-manager.spec.ts` | Added `IS_ROADMAP_VIEW_ENABLED: false` to the exhaustive `featureFlagsMap` fixture required by the `Record<FeatureFlagKey, boolean>` type. | feature/roadmap-fase0-spike-spv (Fase 0) | Mechanical: whenever upstream adds new flags, this map must be kept exhaustive. |

## Upcoming phases (expected upstream touch-points — anticipated for planning, will be populated as work lands)

- Fase 1: `packages/twenty-shared/src/types/ViewType.ts`, `view.entity.ts`, `view.dto.ts`, create-view/update-view inputs.
- Fase 2: `view-tools.factory.ts`, `flat-view-validator.service.ts`, flat-view util.
- Fase 3: `packages/twenty-front/src/modules/views/types/ViewType.ts` (icon mapping), `RecordIndexContainer.tsx`, `useLoadRecordIndexStates.ts`.
- Fase 4: `ViewPickerTypeSelectOptions.ts`, `ViewPickerContentCreateMode.tsx`.
