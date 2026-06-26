import { type MigrationInterface, type QueryRunner } from 'typeorm';

// Fix-up for `1776370918527-addRoadmapTypeAndZoomEnumsToView.ts`, which
// recreated `view_type_enum` WITHOUT `FIELDS_WIDGET` (the migration was
// authored from an older CALENDAR template that pre-dated that enum
// value). Upstream v1.23 later added an instance command that does
// `ADD VALUE 'TABLE_WIDGET' AFTER 'FIELDS_WIDGET'`, which blows up on
// our fork because FIELDS_WIDGET isn't there.
//
// Idempotent — `ADD VALUE IF NOT EXISTS` is a no-op on fresh dev DBs
// that already have FIELDS_WIDGET from upstream's earlier migration.
export class RestoreFieldsWidgetInViewTypeEnum1776370918600
  implements MigrationInterface
{
  name = 'RestoreFieldsWidgetInViewTypeEnum1776370918600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum" ADD VALUE IF NOT EXISTS 'FIELDS_WIDGET' AFTER 'CALENDAR'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres has no DROP VALUE for enums; leave FIELDS_WIDGET in place
    // on rollback. A true rollback would require CREATE TYPE ... + SWAP
    // + DROP, but FIELDS_WIDGET isn't ours to own.
  }
}
