import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillingMonthToInvoices1756547414593 implements MigrationInterface {
    name = 'AddBillingMonthToInvoices1756547414593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add billing_month column
        await queryRunner.query(`ALTER TABLE "invoice" ADD "billing_month" character varying(7)`);
        await queryRunner.query(`COMMENT ON COLUMN "invoice"."billing_month" IS 'Billing month in YYYY-MM format'`);
        
        // Backfill existing invoices with billing_month based on period_start
        await queryRunner.query(`
            UPDATE "invoice" 
            SET "billing_month" = TO_CHAR(TO_DATE("period_start", 'YYYY-MM-DD'), 'YYYY-MM')
            WHERE "billing_month" IS NULL
        `);
        
        // Make billing_month required after backfilling
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET NOT NULL`);
        
        // Add unique index for (lease_id, billing_month) where status != 'void'
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_invoice_lease_billing_month" 
            ON "invoice" ("lease_id", "billing_month") 
            WHERE status != 'void'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the unique index
        await queryRunner.query(`DROP INDEX "public"."IDX_invoice_lease_billing_month"`);
        
        // Remove the billing_month column
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "billing_month"`);
    }
}
