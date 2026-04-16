import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRoadmapTypeAndZoomEnumsToView1776370918527
  implements MigrationInterface
{
  name = 'AddRoadmapTypeAndZoomEnumsToView1776370918527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."view_roadmap_zoom_enum" AS ENUM('DAY', 'WEEK', 'MONTH', 'QUARTER')`,
    );
    // Drop CHK_VIEW_CALENDAR_INTEGRITY before swapping the enum type — the
    // CHECK body retains a reference to the old enum type and blocks the
    // ALTER COLUMN ... USING cast otherwise. We recreate it at the end.
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum" RENAME TO "view_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_type_enum" AS ENUM('TABLE', 'KANBAN', 'CALENDAR', 'FIELDS_WIDGET', 'ROADMAP')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" TYPE "core"."view_type_enum" USING "type"::"text"::"core"."view_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" SET DEFAULT 'TABLE'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY" CHECK (("type" != 'CALENDAR' OR ("calendarLayout" IS NOT NULL AND "calendarFieldMetadataId" IS NOT NULL)))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_type_enum_old" AS ENUM('TABLE', 'KANBAN', 'CALENDAR', 'FIELDS_WIDGET')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" TYPE "core"."view_type_enum_old" USING "type"::"text"::"core"."view_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" SET DEFAULT 'TABLE'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum_old" RENAME TO "view_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_roadmap_zoom_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY" CHECK (("type" != 'CALENDAR' OR ("calendarLayout" IS NOT NULL AND "calendarFieldMetadataId" IS NOT NULL)))`,
    );
  }
}
