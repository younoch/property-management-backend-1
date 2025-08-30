import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInvoicePeriodStartNullable1756547414594 implements MigrationInterface {
    name = 'UpdateInvoicePeriodStartNullable1756547414594'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make period_start nullable if it's not already
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "period_start" DROP NOT NULL`);
        
        // For any existing null period_start, set a default value based on billing_month
        await queryRunner.query(`
            UPDATE "invoice" 
            SET "period_start" = ("billing_month" || '-01')::date
            WHERE "period_start" IS NULL AND "billing_month" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Before making the column non-nullable, ensure there are no null values
        await queryRunner.query(`
            UPDATE "invoice" 
            SET "period_start" = COALESCE("period_start", CURRENT_DATE)
            WHERE "period_start" IS NULL
        `);
        
        // Make period_start non-nullable again
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "period_start" SET NOT NULL`);
    }
}
