import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateExistingUsersOnboarding1757181216009 implements MigrationInterface {
    name = 'UpdateExistingUsersOnboarding1757181216009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Set onboarding values for existing users
        await queryRunner.query(`
            UPDATE "user" 
            SET 
                "requires_onboarding" = false, 
                "onboarding_completed_at" = NOW() 
            WHERE 1=1
        `);
        
        // The following lines are unrelated to our changes but are part of the migration
        await queryRunner.query(`DROP INDEX "public"."IDX_467ce77b0c2b05049d3a561987"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET DEFAULT to_char(CURRENT_DATE, 'YYYY-MM')`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_467ce77b0c2b05049d3a561987" ON "invoice" ("lease_id", "billing_month") WHERE status != 'void'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No need to revert the data update as it's not reversible in a meaningful way
        
        // Revert the schema changes
        await queryRunner.query(`DROP INDEX "public"."IDX_467ce77b0c2b05049d3a561987"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET DEFAULT to_char((CURRENT_DATE), 'YYYY-MM')`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_467ce77b0c2b05049d3a561987" ON "invoice" ("lease_id", "billing_month") WHERE (status <> 'void'::invoice_status_enum)`);
        
        // Note: We don't drop the columns here as they might be in use by the application
        // and dropping them could cause issues. If needed, this should be handled manually.
    }

}
