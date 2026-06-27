import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';

// Re-runs the standard-application sync after adding the
// taskTarget ↔ opportunityMilestone morph relation (and the inverse
// `taskTargets` field on opportunityMilestone). Without this re-run,
// existing workspaces lack the `targetOpportunityMilestoneId` column
// on taskTarget and the front-end "Tasks" tab on a milestone returns
// 400 ("taskTarget object doesn't have any targetOpportunityMilestoneId field").
//
// The sync service is idempotent — workspaces that already match the
// desired state get a no-op migration.
@RegisteredWorkspaceCommand('2.5.0', 1779456242590)
@Command({
  name: 'upgrade:2-5:resync-twenty-standard-application-spv',
  description:
    'Re-sync twenty-standard application across existing workspaces so the new taskTarget ↔ opportunityMilestone relation materializes.',
})
export class ResyncTwentyStandardApplicationSpvV25Command extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly twentyStandardApplicationService: TwentyStandardApplicationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would re-sync twenty-standard application for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Re-syncing twenty-standard application for workspace ${workspaceId}`,
    );

    // SPV: this 2.5-era one-off triggers a FULL twenty-standard re-sync. On
    // workspaces whose metadata has drifted from the standard definition
    // (custom / cross-application view fields, legacy field defaults that the
    // newer validators reject), that full re-sync fails and permanently blocks
    // the upgrade pipeline at this step. The command's actual purpose — making
    // the taskTarget <-> opportunityMilestone relation exist — is already
    // satisfied on existing workspaces, and standard metadata is kept current
    // by the 2.6 -> 2.16 upgrade commands and the boot-time sync. Treat a
    // re-sync failure as non-fatal so the rest of the upgrade can proceed.
    try {
      await this.twentyStandardApplicationService.synchronizeTwentyStandardApplicationOrThrow(
        { workspaceId },
      );

      this.logger.log(
        `Re-synced twenty-standard application for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Skipping twenty-standard re-sync for workspace ${workspaceId} (non-fatal): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
