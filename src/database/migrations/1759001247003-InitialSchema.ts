import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759001247003 implements MigrationInterface {
    name = 'InitialSchema1759001247003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Removed DROP CONSTRAINT statements as they are handled in the InitialSchemaFix migration
        await queryRunner.query(`CREATE TABLE "unit" ("id" SERIAL NOT NULL, "property_id" integer NOT NULL, "label" character varying NOT NULL, "bedrooms" integer, "bathrooms" integer, "sqft" integer, "market_rent" numeric(12,2), "status" character varying NOT NULL DEFAULT 'vacant', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d16001384f6d95251d979076a57" UNIQUE ("property_id", "label"), CONSTRAINT "PK_4252c4be609041e559f0c80f58a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ffd1df4d8c19a8bd49fcd8af71" ON "unit" ("property_id") `);
        await queryRunner.query(`CREATE TABLE "lease_tenant" ("lease_id" integer NOT NULL, "tenant_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "is_primary" boolean NOT NULL DEFAULT false, "moved_in_date" date, "moved_out_date" date, "relationship" character varying(255), CONSTRAINT "PK_b5f56ce129b079a8b45f3250081" PRIMARY KEY ("lease_id", "tenant_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2ba7f599a8c3548cf23efa7421" ON "lease_tenant" ("lease_id", "is_primary") WHERE is_primary = true`);
        await queryRunner.query(`CREATE TABLE "lease" ("id" SERIAL NOT NULL, "unit_id" integer NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "rent" numeric(12,2) NOT NULL, "deposit" numeric(12,2) NOT NULL DEFAULT '0', "billing_day" integer, "grace_days" integer, "late_fee_flat" numeric(12,2), "late_fee_percent" numeric(5,2), "notes" text, "status" character varying NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_954811694773f24986695203663" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f11320558c167027aa972c92bf" ON "lease" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca091675febe801029d4db0f64" ON "lease" ("unit_id") `);
        await queryRunner.query(`CREATE TABLE "lease_charge" ("id" SERIAL NOT NULL, "lease_id" integer NOT NULL, "name" character varying NOT NULL, "unit_id" integer NOT NULL, "property_id" integer NOT NULL, "amount" numeric(12,2) NOT NULL, "cadence" character varying NOT NULL DEFAULT 'monthly', "start_date" date NOT NULL, "end_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_09772a7297c9b7a7e1300be76ba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_05ec29a7dc2334ac370eb8719c" ON "lease_charge" ("property_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cb383f9d3e410323aa5c7232cc" ON "lease_charge" ("unit_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ecd198da30e9be7ae2c8ffe9d" ON "lease_charge" ("lease_id") `);
        await queryRunner.query(`CREATE TABLE "payment" ("id" SERIAL NOT NULL, "lease_id" integer NOT NULL, "amount" numeric(12,2) NOT NULL, "unapplied_amount" numeric(12,2) NOT NULL DEFAULT '0', "method" "public"."payment_method_enum" NOT NULL DEFAULT 'cash', "at" date NOT NULL, "reference" character varying, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2d5167c4ef1c8ab3342ac3d05e" ON "payment" ("lease_id") `);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" SERIAL NOT NULL, "lease_id" integer, "invoice_number" character varying(50) NOT NULL, "issue_date" date NOT NULL DEFAULT ('now'::text)::date, "due_date" date, "grace_days" integer NOT NULL DEFAULT '0', "subtotal" numeric(12,2) NOT NULL DEFAULT '0', "tax_rate" numeric(5,2) NOT NULL DEFAULT '0', "tax_amount" numeric(12,2) NOT NULL DEFAULT '0', "total_amount" numeric(12,2) NOT NULL DEFAULT '0', "amount_paid" numeric(12,2) NOT NULL DEFAULT '0', "balance_due" numeric(12,2) NOT NULL DEFAULT '0', "billing_month" character varying(7) NOT NULL, "period_start" date NOT NULL, "period_end" date NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'draft', "notes" text, "terms" text, "sent_at" TIMESTAMP WITH TIME ZONE, "paid_at" TIMESTAMP WITH TIME ZONE, "voided_at" TIMESTAMP WITH TIME ZONE, "metadata" jsonb, "is_issued" boolean NOT NULL DEFAULT false, "items" jsonb NOT NULL DEFAULT '[]'::jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE ("invoice_number"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id")); COMMENT ON COLUMN "invoices"."invoice_number" IS 'Unique invoice number'; COMMENT ON COLUMN "invoices"."issue_date" IS 'Date when the invoice was created/issued'; COMMENT ON COLUMN "invoices"."due_date" IS 'Due date for payment'; COMMENT ON COLUMN "invoices"."grace_days" IS 'Grace period in days after due date before late fees apply'; COMMENT ON COLUMN "invoices"."subtotal" IS 'Subtotal amount before tax'; COMMENT ON COLUMN "invoices"."tax_rate" IS 'Tax rate in percentage'; COMMENT ON COLUMN "invoices"."tax_amount" IS 'Total tax amount'; COMMENT ON COLUMN "invoices"."total_amount" IS 'Total amount including tax'; COMMENT ON COLUMN "invoices"."amount_paid" IS 'Amount paid so far'; COMMENT ON COLUMN "invoices"."balance_due" IS 'Remaining balance'; COMMENT ON COLUMN "invoices"."billing_month" IS 'Billing month in YYYY-MM format'; COMMENT ON COLUMN "invoices"."period_start" IS 'Start date of the billing period'; COMMENT ON COLUMN "invoices"."period_end" IS 'End date of the billing period'; COMMENT ON COLUMN "invoices"."status" IS 'Current status of the invoice'; COMMENT ON COLUMN "invoices"."notes" IS 'Additional notes for the invoice'; COMMENT ON COLUMN "invoices"."terms" IS 'Terms and conditions for the invoice'; COMMENT ON COLUMN "invoices"."sent_at" IS 'When the invoice was sent to the customer'; COMMENT ON COLUMN "invoices"."paid_at" IS 'When the invoice was paid'; COMMENT ON COLUMN "invoices"."voided_at" IS 'When the invoice was voided'; COMMENT ON COLUMN "invoices"."metadata" IS 'Additional metadata for the invoice'; COMMENT ON COLUMN "invoices"."is_issued" IS 'Whether the invoice has been issued to the tenant'; COMMENT ON COLUMN "invoices"."items" IS 'Line items on this invoice'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5721da3283cc742b1db3427e08" ON "invoices" ("lease_id", "billing_month") WHERE status != 'void'`);
        await queryRunner.query(`CREATE INDEX "IDX_298cb55cdf1a44fbcb097fdf69" ON "invoices" ("status", "due_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_0457ee681a50419881ea2ee796" ON "invoices" ("due_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_da309569f957adb1f09c8bb109" ON "invoices" ("lease_id") `);
        await queryRunner.query(`ALTER TABLE "portfolio" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "portfolio_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" ADD "portfolio_id" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_5ec9aa64430984435e8a026266" ON "notification" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c02eecc90e0de3c1742116fefa" ON "portfolio_member" ("portfolio_id") `);
        await queryRunner.query(`ALTER TABLE "portfolio_member" ADD CONSTRAINT "UQ_c3f978c50b74de4cd6587b36084" UNIQUE ("portfolio_id", "user_id")`);
        await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "FK_ffd1df4d8c19a8bd49fcd8af71b" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_5ec9aa64430984435e8a0262669" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" ADD CONSTRAINT "FK_c02eecc90e0de3c1742116fefa7" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lease_tenant" ADD CONSTRAINT "FK_1002d49fc6e6a01abf5308403c8" FOREIGN KEY ("lease_id") REFERENCES "lease"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lease_tenant" ADD CONSTRAINT "FK_64b69371ab43b1453ba3e1229de" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lease" ADD CONSTRAINT "FK_ca091675febe801029d4db0f642" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lease_charge" ADD CONSTRAINT "FK_4ecd198da30e9be7ae2c8ffe9db" FOREIGN KEY ("lease_id") REFERENCES "lease"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lease_charge" ADD CONSTRAINT "FK_cb383f9d3e410323aa5c7232cc7" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lease_charge" ADD CONSTRAINT "FK_05ec29a7dc2334ac370eb8719c0" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6" FOREIGN KEY ("lease_id") REFERENCES "lease"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_application" ADD CONSTRAINT "FK_2b4fa2d71c82de59053aa0aca72" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_application" ADD CONSTRAINT "FK_9c8c30c178ebe905e59077f84ab" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_da309569f957adb1f09c8bb1095" FOREIGN KEY ("lease_id") REFERENCES "lease"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "maintenance_request" ADD CONSTRAINT "FK_7990604abb047d1e163e437fc6a" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Removed DROP CONSTRAINT statements as they are handled in the InitialSchemaFix migration
        await queryRunner.query(`DROP INDEX "public"."IDX_c02eecc90e0de3c1742116fefa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5ec9aa64430984435e8a026266"`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" DROP COLUMN "portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "portfolio" ADD "user_id" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da309569f957adb1f09c8bb109"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0457ee681a50419881ea2ee796"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_298cb55cdf1a44fbcb097fdf69"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5721da3283cc742b1db3427e08"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d5167c4ef1c8ab3342ac3d05e"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ecd198da30e9be7ae2c8ffe9d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb383f9d3e410323aa5c7232cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_05ec29a7dc2334ac370eb8719c"`);
        await queryRunner.query(`DROP TABLE "lease_charge"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca091675febe801029d4db0f64"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f11320558c167027aa972c92bf"`);
        await queryRunner.query(`DROP TABLE "lease"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ba7f599a8c3548cf23efa7421"`);
        await queryRunner.query(`DROP TABLE "lease_tenant"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ffd1df4d8c19a8bd49fcd8af71"`);
        await queryRunner.query(`DROP TABLE "unit"`);
    }

}
