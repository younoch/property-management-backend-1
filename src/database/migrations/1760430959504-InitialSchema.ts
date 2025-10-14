import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760430959504 implements MigrationInterface {
    name = 'InitialSchema1760430959504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_feedback" DROP CONSTRAINT "FK_user_feedback_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_feedback_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_feedback_is_reviewed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_feedback_created_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "user_feedback" ADD CONSTRAINT "FK_9eb49089eddfe8b11e18073cd79" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_feedback" DROP CONSTRAINT "FK_9eb49089eddfe8b11e18073cd79"`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`CREATE INDEX "IDX_user_feedback_created_at" ON "user_feedback" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_feedback_is_reviewed" ON "user_feedback" ("is_reviewed") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_feedback_user_id" ON "user_feedback" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "user_feedback" ADD CONSTRAINT "FK_user_feedback_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
