import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLeaseChargeEntity1757301505103 implements MigrationInterface {
    name = 'UpdateLeaseChargeEntity1757301505103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ADD "tax_rate" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."tax_rate" IS 'Tax rate in percentage'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_298cb55cdf1a44fbcb097fdf69"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5721da3283cc742b1db3427e08"`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."due_date" IS 'Due date for payment'`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "billing_month" DROP DEFAULT`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."period_start" IS 'Start date of the billing period'`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."period_end" IS 'End date of the billing period'`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "paid_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "paid_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."paid_at" IS 'When the invoice was paid'`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "voided_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "voided_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."voided_at" IS 'When the invoice was voided'`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5721da3283cc742b1db3427e08" ON "invoices" ("lease_id", "billing_month") WHERE status != 'void'`);
        await queryRunner.query(`CREATE INDEX "IDX_298cb55cdf1a44fbcb097fdf69" ON "invoices" ("status", "due_date") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_298cb55cdf1a44fbcb097fdf69"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5721da3283cc742b1db3427e08"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."voided_at" IS 'When the invoice was voided'`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "voided_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "voided_at" TIMESTAMP`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."paid_at" IS 'When the invoice was paid'`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "paid_at"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "paid_at" TIMESTAMP`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."period_end" IS 'End date of the billing period (ISO format)'`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."period_start" IS 'Start date of the billing period (ISO format)'`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "billing_month" SET DEFAULT to_char((CURRENT_DATE), 'YYYY-MM')`);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."due_date" IS 'Due date for payment, calculated based on issue_date + payment_terms'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5721da3283cc742b1db3427e08" ON "invoices" ("lease_id", "billing_month") WHERE ((status)::text <> 'void'::text)`);
        await queryRunner.query(`CREATE INDEX "IDX_298cb55cdf1a44fbcb097fdf69" ON "invoices" ("due_date", "status") `);
        await queryRunner.query(`COMMENT ON COLUMN "invoices"."tax_rate" IS 'Tax rate in percentage'`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "tax_rate"`);
    }

}
