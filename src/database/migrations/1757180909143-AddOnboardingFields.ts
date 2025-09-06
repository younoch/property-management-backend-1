import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnboardingFields1757180909143 implements MigrationInterface {
    name = 'AddOnboardingFields1757180909143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the new columns with default values
        await queryRunner.query(`ALTER TABLE "user" ADD "requires_onboarding" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "onboarding_completed_at" TIMESTAMP`);
        
        // Set default values for existing users (completed onboarding)
        await queryRunner.query(`UPDATE "user" SET "requires_onboarding" = false, "onboarding_completed_at" = NOW() WHERE 1=1`);
        
        // The following lines are unrelated to our changes but are part of the migration
        await queryRunner.query(`DROP INDEX "public"."IDX_467ce77b0c2b05049d3a561987"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET DEFAULT to_char(CURRENT_DATE, 'YYYY-MM')`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_467ce77b0c2b05049d3a561987" ON "invoice" ("lease_id", "billing_month") WHERE status != 'void'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_467ce77b0c2b05049d3a561987"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET DEFAULT to_char((CURRENT_DATE), 'YYYY-MM')`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_467ce77b0c2b05049d3a561987" ON "invoice" ("lease_id", "billing_month") WHERE (status <> 'void'::invoice_status_enum)`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "onboarding_completed_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "requires_onboarding"`);
    }

}
