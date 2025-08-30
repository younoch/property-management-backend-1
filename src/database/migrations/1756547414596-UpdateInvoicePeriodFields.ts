import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInvoicePeriodFields1756547414596 implements MigrationInterface {
    name = 'UpdateInvoicePeriodFields1756547414596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make period_start non-nullable with a default value
        await queryRunner.query(`
            ALTER TABLE "invoice" 
            ALTER COLUMN "period_start" SET NOT NULL,
            ALTER COLUMN "period_start" SET DEFAULT CURRENT_DATE
        `);

        // Make period_end non-nullable with a default value (end of current month)
        await queryRunner.query(`
            ALTER TABLE "invoice" 
            ALTER COLUMN "period_end" SET NOT NULL,
            ALTER COLUMN "period_end" SET DEFAULT (DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH - 1 day')::date
        `);

        // Ensure billing_month is properly set for existing records
        await queryRunner.query(`
            UPDATE "invoice" 
            SET "billing_month" = TO_CHAR("period_start"::date, 'YYYY-MM')
            WHERE "billing_month" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert period_start to nullable
        await queryRunner.query(`
            ALTER TABLE "invoice" 
            ALTER COLUMN "period_start" DROP NOT NULL,
            ALTER COLUMN "period_start" DROP DEFAULT
        `);

        // Revert period_end to nullable
        await queryRunner.query(`
            ALTER TABLE "invoice" 
            ALTER COLUMN "period_end" DROP NOT NULL,
            ALTER COLUMN "period_end" DROP DEFAULT
        `);
    }
}
