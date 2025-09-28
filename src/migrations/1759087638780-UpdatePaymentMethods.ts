import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentMethods1759087638780 implements MigrationInterface {
    name = 'UpdatePaymentMethods1759087638780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT "FK_unit_property"`);
        await queryRunner.query(`ALTER TABLE "property" DROP CONSTRAINT "FK_property_portfolio"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "FK_tenant_portfolio"`);
        await queryRunner.query(`ALTER TABLE "lease" DROP CONSTRAINT "FK_lease_unit"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_UNIT_PROPERTY_ID"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_PROPERTY_PORTFOLIO_ID"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_TENANT_PORTFOLIO_ID"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_LEASE_UNIT_ID"`);
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "method" TO "payment_method"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_method_enum" RENAME TO "payment_payment_method_enum"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_payment_method_enum" RENAME TO "payment_payment_method_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payment_payment_method_enum" AS ENUM('credit_card', 'debit_card', 'bank_transfer', 'ach_transfer', 'wire_transfer', 'check', 'money_order', 'cash', 'paypal', 'venmo', 'zelle', 'cash_app', 'cryptocurrency', 'other')`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "payment_method" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "payment_method" TYPE "public"."payment_payment_method_enum" USING "payment_method"::"text"::"public"."payment_payment_method_enum"`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "payment_method" SET DEFAULT 'bank_transfer'`);
        await queryRunner.query(`DROP TYPE "public"."payment_payment_method_enum_old"`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "payment_method"`);
        await queryRunner.query(`CREATE TYPE "public"."expenses_payment_method_enum" AS ENUM('credit_card', 'debit_card', 'bank_transfer', 'ach_transfer', 'wire_transfer', 'check', 'money_order', 'cash', 'paypal', 'venmo', 'zelle', 'cash_app', 'cryptocurrency', 'other')`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "payment_method" "public"."expenses_payment_method_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "payment_method"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_payment_method_enum"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "payment_method" character varying`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`CREATE TYPE "public"."payment_payment_method_enum_old" AS ENUM('cash', 'bank_transfer', 'card', 'ach', 'mobile')`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "payment_method" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "payment_method" TYPE "public"."payment_payment_method_enum_old" USING "payment_method"::"text"::"public"."payment_payment_method_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "payment_method" SET DEFAULT 'cash'`);
        await queryRunner.query(`DROP TYPE "public"."payment_payment_method_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_payment_method_enum_old" RENAME TO "payment_payment_method_enum"`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD "category_id" integer`);
        await queryRunner.query(`ALTER TYPE "public"."payment_payment_method_enum" RENAME TO "payment_method_enum"`);
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "payment_method" TO "method"`);
        await queryRunner.query(`CREATE INDEX "IDX_LEASE_UNIT_ID" ON "lease" ("unit_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_TENANT_PORTFOLIO_ID" ON "tenant" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_PROPERTY_PORTFOLIO_ID" ON "property" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_UNIT_PROPERTY_ID" ON "unit" ("property_id") `);
        await queryRunner.query(`ALTER TABLE "lease" ADD CONSTRAINT "FK_lease_unit" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_tenant_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "property" ADD CONSTRAINT "FK_property_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "FK_unit_property" FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
