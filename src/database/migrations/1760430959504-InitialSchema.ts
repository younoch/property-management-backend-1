import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760430959504 implements MigrationInterface {
    name = 'InitialSchema1760430959504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Guard: Only attempt to alter user_feedback if it exists (fresh DBs may not have it yet)
        const hasUserFeedback = await queryRunner.hasTable('user_feedback');
        if (hasUserFeedback) {
            await queryRunner.query(`ALTER TABLE "user_feedback" DROP CONSTRAINT "FK_user_feedback_user"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_user_feedback_user_id"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_user_feedback_is_reviewed"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_user_feedback_created_at"`);
        }
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        if (hasUserFeedback) {
            await queryRunner.query(`ALTER TABLE "user_feedback" ADD CONSTRAINT "FK_9eb49089eddfe8b11e18073cd79" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasUserFeedback = await queryRunner.hasTable('user_feedback');
        if (hasUserFeedback) {
            await queryRunner.query(`ALTER TABLE "user_feedback" DROP CONSTRAINT "FK_9eb49089eddfe8b11e18073cd79"`);
        }
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        if (hasUserFeedback) {
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_feedback_created_at" ON "user_feedback" ("created_at") `);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_feedback_is_reviewed" ON "user_feedback" ("is_reviewed") `);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_feedback_user_id" ON "user_feedback" ("user_id") `);
            await queryRunner.query(`ALTER TABLE "user_feedback" ADD CONSTRAINT "FK_user_feedback_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        }
    }

}
