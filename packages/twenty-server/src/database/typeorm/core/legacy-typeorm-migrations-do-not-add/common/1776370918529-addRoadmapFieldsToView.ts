import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRoadmapFieldsToView1776370918529 implements MigrationInterface {
  name = 'AddRoadmapFieldsToView1776370918529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "roadmapDefaultZoom" "core"."view_roadmap_zoom_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "roadmapShowToday" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "roadmapShowWeekends" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "roadmapFieldStartId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "roadmapFieldEndId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "roadmapFieldGroupId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "roadmapFieldColorId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "roadmapFieldLabelId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_ROADMAP_FIELD_START" ON "core"."view" ("roadmapFieldStartId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_ROADMAP_FIELD_END" ON "core"."view" ("roadmapFieldEndId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_VIEW_ROADMAP_FIELD_START" FOREIGN KEY ("roadmapFieldStartId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_VIEW_ROADMAP_FIELD_END" FOREIGN KEY ("roadmapFieldEndId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_VIEW_ROADMAP_FIELD_GROUP" FOREIGN KEY ("roadmapFieldGroupId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_VIEW_ROADMAP_FIELD_COLOR" FOREIGN KEY ("roadmapFieldColorId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_VIEW_ROADMAP_FIELD_LABEL" FOREIGN KEY ("roadmapFieldLabelId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_ROADMAP_INTEGRITY" CHECK (("type" != 'ROADMAP' OR ("roadmapFieldStartId" IS NOT NULL AND "roadmapFieldEndId" IS NOT NULL AND "roadmapFieldStartId" != "roadmapFieldEndId")))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "CHK_VIEW_ROADMAP_INTEGRITY"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_VIEW_ROADMAP_FIELD_LABEL"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_VIEW_ROADMAP_FIELD_COLOR"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_VIEW_ROADMAP_FIELD_GROUP"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_VIEW_ROADMAP_FIELD_END"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_VIEW_ROADMAP_FIELD_START"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_ROADMAP_FIELD_END"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_ROADMAP_FIELD_START"`);
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "roadmapFieldLabelId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "roadmapFieldColorId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "roadmapFieldGroupId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "roadmapFieldEndId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "roadmapFieldStartId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "roadmapShowWeekends"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "roadmapShowToday"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "roadmapDefaultZoom"`,
    );
  }
}
