import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntitySnakeCase1758988262624 implements MigrationInterface {
    name = 'UpdateUserEntitySnakeCase1758988262624'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop constraints only if they exist
        const propertyTable = await queryRunner.getTable('property');
        const portfolioTable = await queryRunner.getTable('portfolio');
        const tenantTable = await queryRunner.getTable('tenant');

        // Drop property constraint if it exists
        if (propertyTable) {
            const propertyFk = propertyTable.foreignKeys.find(fk => fk.name === 'FK_property_portfolio');
            if (propertyFk) {
                await queryRunner.query(`ALTER TABLE "property" DROP CONSTRAINT "FK_property_portfolio"`);
            }
        }

        // Drop portfolio constraint if it exists
        if (portfolioTable) {
            const portfolioFk = portfolioTable.foreignKeys.find(fk => fk.name === 'FK_portfolio_user');
            if (portfolioFk) {
                await queryRunner.query(`ALTER TABLE "portfolio" DROP CONSTRAINT "FK_portfolio_user"`);
            }
        }

        // Drop tenant constraint if it exists
        if (tenantTable) {
            const tenantFk = tenantTable.foreignKeys.find(fk => fk.name === 'FK_tenant_portfolio');
            if (tenantFk) {
                await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "FK_tenant_portfolio"`);
            }
        }
        // Drop indexes only if they exist
        try {
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_PROPERTY_PORTFOLIO_ID"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_PORTFOLIO_USER_ID"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_TENANT_PORTFOLIO_ID"`);
        } catch (error) {
            console.log('Error dropping indexes, continuing...', error.message);
        }

        // Check if tables exist before creating them
        const hasUnitTable = await queryRunner.hasTable('unit');
        const hasLeaseTenantTable = await queryRunner.hasTable('lease_tenant');
        const hasLeaseTable = await queryRunner.hasTable('lease');
        const hasLeaseChargeTable = await queryRunner.hasTable('lease_charge');
        // Create tables only if they don't exist
        if (!hasUnitTable) {
            await queryRunner.query(`CREATE TABLE "unit" ("id" SERIAL NOT NULL, "property_id" integer NOT NULL, "label" character varying NOT NULL, "bedrooms" integer, "bathrooms" integer, "sqft" integer, "market_rent" numeric(12,2), "status" character varying NOT NULL DEFAULT 'vacant', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d16001384f6d95251d979076a57" UNIQUE ("property_id", "label"), CONSTRAINT "PK_4252c4be609041e559f0c80f58a" PRIMARY KEY ("id"))`);
            await queryRunner.query(`CREATE INDEX "IDX_ffd1df4d8c19a8bd49fcd8af71" ON "unit" ("property_id") `);
        }

        if (!hasLeaseTable) {
            await queryRunner.query(`CREATE TABLE "lease" ("id" SERIAL NOT NULL, "unit_id" integer NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "rent" numeric(12,2) NOT NULL, "deposit" numeric(12,2) NOT NULL DEFAULT '0', "billing_day" integer, "grace_days" integer, "late_fee_flat" numeric(12,2), "late_fee_percent" numeric(5,2), "notes" text, "status" character varying NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_954811694773f24986695203663" PRIMARY KEY ("id"))`);
            await queryRunner.query(`CREATE INDEX "IDX_f11320558c167027aa972c92bf" ON "lease" ("status") `);
            await queryRunner.query(`CREATE INDEX "IDX_ca091675febe801029d4db0f64" ON "lease" ("unit_id") `);
        }

        if (!hasLeaseTenantTable) {
            await queryRunner.query(`CREATE TABLE "lease_tenant" ("lease_id" integer NOT NULL, "tenant_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "is_primary" boolean NOT NULL DEFAULT false, "moved_in_date" date, "moved_out_date" date, "relationship" character varying(255), CONSTRAINT "PK_b5f56ce129b079a8b45f3250081" PRIMARY KEY ("lease_id", "tenant_id"))`);
            await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2ba7f599a8c3548cf23efa7421" ON "lease_tenant" ("lease_id", "is_primary") WHERE is_primary = true`);
        }

        if (!hasLeaseChargeTable) {
            await queryRunner.query(`CREATE TABLE "lease_charge" ("id" SERIAL NOT NULL, "lease_id" integer NOT NULL, "name" character varying NOT NULL, "unit_id" integer NOT NULL, "property_id" integer NOT NULL, "amount" numeric(12,2) NOT NULL, "cadence" character varying NOT NULL DEFAULT 'monthly', "start_date" date NOT NULL, "end_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_09772a7297c9b7a7e1300be76ba" PRIMARY KEY ("id"))`);
            await queryRunner.query(`CREATE INDEX "IDX_05ec29a7dc2334ac370eb8719c" ON "lease_charge" ("property_id") `);
            await queryRunner.query(`CREATE INDEX "IDX_cb383f9d3e410323aa5c7232cc" ON "lease_charge" ("unit_id") `);
            await queryRunner.query(`CREATE INDEX "IDX_4ecd198da30e9be7ae2c8ffe9d" ON "lease_charge" ("lease_id") `);
        } else {
            // Check if indexes exist before creating them
            const leaseChargeIndexes = await queryRunner.query(`
                SELECT indexname FROM pg_indexes 
                WHERE tablename = 'lease_charge' AND 
                      (indexname = 'IDX_cb383f9d3e410323aa5c7232cc' OR 
                       indexname = 'IDX_4ecd198da30e9be7ae2c8ffe9d')
            `);
            
            const existingIndexes = leaseChargeIndexes.map((i: any) => i.indexname);
            
            if (!existingIndexes.includes('IDX_cb383f9d3e410323aa5c7232cc')) {
                await queryRunner.query(`CREATE INDEX "IDX_cb383f9d3e410323aa5c7232cc" ON "lease_charge" ("unit_id") `);
            }
            if (!existingIndexes.includes('IDX_4ecd198da30e9be7ae2c8ffe9d')) {
                await queryRunner.query(`CREATE INDEX "IDX_4ecd198da30e9be7ae2c8ffe9d" ON "lease_charge" ("lease_id") `);
            }
        }

        // Check if payment table exists
        const hasPaymentTable = await queryRunner.hasTable('payment');
        if (!hasPaymentTable) {
            await queryRunner.query(`CREATE TABLE "payment" ("id" SERIAL NOT NULL, "lease_id" integer NOT NULL, "amount" numeric(12,2) NOT NULL, "unapplied_amount" numeric(12,2) NOT NULL DEFAULT '0', "method" "public"."payment_method_enum" NOT NULL DEFAULT 'cash', "at" date NOT NULL, "reference" character varying, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
            await queryRunner.query(`CREATE INDEX "IDX_2d5167c4ef1c8ab3342ac3d05e" ON "payment" ("lease_id") `);
        } else {
            // Check if index exists before creating it
            const paymentIndex = await queryRunner.query(`
                SELECT 1 FROM pg_indexes 
                WHERE tablename = 'payment' AND 
                      indexname = 'IDX_2d5167c4ef1c8ab3342ac3d05e'
            `);
            
            if (paymentIndex.length === 0) {
                await queryRunner.query(`CREATE INDEX "IDX_2d5167c4ef1c8ab3342ac3d05e" ON "payment" ("lease_id") `);
            }
        }

        // Check if invoices table exists
        const hasInvoicesTable = await queryRunner.hasTable('invoices');
        if (!hasInvoicesTable) {
            await queryRunner.query(`CREATE TABLE "invoices" ("id" SERIAL NOT NULL, "lease_id" integer, "invoice_number" character varying(50) NOT NULL, "issue_date" date NOT NULL DEFAULT ('now'::text)::date, "due_date" date, "grace_days" integer NOT NULL DEFAULT '0', "subtotal" numeric(12,2) NOT NULL DEFAULT '0', "tax_rate" numeric(5,2) NOT NULL DEFAULT '0', "tax_amount" numeric(12,2) NOT NULL DEFAULT '0', "total_amount" numeric(12,2) NOT NULL DEFAULT '0', "amount_paid" numeric(12,2) NOT NULL DEFAULT '0', "balance_due" numeric(12,2) NOT NULL DEFAULT '0', "billing_month" character varying(7) NOT NULL, "period_start" date NOT NULL, "period_end" date NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'draft', "notes" text, "terms" text, "sent_at" TIMESTAMP WITH TIME ZONE, "paid_at" TIMESTAMP WITH TIME ZONE, "voided_at" TIMESTAMP WITH TIME ZONE, "metadata" jsonb, "is_issued" boolean NOT NULL DEFAULT false, "items" jsonb NOT NULL DEFAULT '[]'::jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
            await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5721da3283cc742b1db3427e08" ON "invoices" ("lease_id", "billing_month") WHERE status != 'void'`);
            await queryRunner.query(`CREATE INDEX "IDX_298cb55cdf1a44fbcb097fdf69" ON "invoices" ("status", "due_date") `);
            await queryRunner.query(`CREATE INDEX "IDX_0457ee681a50419881ea2ee796" ON "invoices" ("due_date") `);
            await queryRunner.query(`CREATE INDEX "IDX_da309569f957adb1f09c8bb109" ON "invoices" ("lease_id") `);
        } else {
            // Check which indexes already exist
            const invoicesIndexes = await queryRunner.query(`
                SELECT indexname FROM pg_indexes 
                WHERE tablename = 'invoices' AND 
                      indexname IN (
                          'IDX_5721da3283cc742b1db342e08',
                          'IDX_298cb55cdf1a44fbcb097fdf69',
                          'IDX_0457ee681a50419881ea2ee796',
                          'IDX_da309569f957adb1f09c8bb109'
                      )
            `);
            
            const existingIndexes = invoicesIndexes.map((i: any) => i.indexname);
            
            if (!existingIndexes.includes('IDX_5721da3283cc742b1db342e08')) {
                await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5721da3283cc742b1db342e08" ON "invoices" ("lease_id", "billing_month") WHERE status != 'void'`);
            }
            if (!existingIndexes.includes('IDX_298cb55cdf1a44fbcb097fdf69')) {
                await queryRunner.query(`CREATE INDEX "IDX_298cb55cdf1a44fbcb097fdf69" ON "invoices" ("status", "due_date") `);
            }
            if (!existingIndexes.includes('IDX_0457ee681a50419881ea2ee796')) {
                await queryRunner.query(`CREATE INDEX "IDX_0457ee681a50419881ea2ee796" ON "invoices" ("due_date") `);
            }
            if (!existingIndexes.includes('IDX_da309569f957adb1f09c8bb109')) {
                await queryRunner.query(`CREATE INDEX "IDX_da309569f957adb1f09c8bb109" ON "invoices" ("lease_id") `);
            }
        }

        // Check if notification table exists and has portfolio_id column
        const hasNotificationTable = await queryRunner.hasTable('notification');
        if (hasNotificationTable) {
            const notificationColumns = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'notification' AND column_name = 'portfolio_id'
            `);
            
            if (notificationColumns.length === 0) {
                await queryRunner.query(`ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "portfolio_id" integer`);
                await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_5ec9aa64430984435e8a026266" ON "notification" ("portfolio_id") `);
            }
        }

        // Check if portfolio_member table exists and has portfolio_id column
        const hasPortfolioMemberTable = await queryRunner.hasTable('portfolio_member');
        if (hasPortfolioMemberTable) {
            const portfolioMemberColumns = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'portfolio_member' AND column_name = 'portfolio_id'
            `);
            
            if (portfolioMemberColumns.length === 0) {
                await queryRunner.query(`ALTER TABLE "portfolio_member" ADD COLUMN IF NOT EXISTS "portfolio_id" integer`);
                await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_c02eecc90e0de3c1742116fefa" ON "portfolio_member" ("portfolio_id") `);
                
                // Check if unique constraint already exists
                const uniqueConstraint = await queryRunner.query(`
                    SELECT conname 
                    FROM pg_constraint 
                    WHERE conname = 'UQ_c3f978c50b74de4cd6587b36084'
                `);
                
                if (uniqueConstraint.length === 0) {
                    await queryRunner.query(`ALTER TABLE "portfolio_member" ADD CONSTRAINT "UQ_c3f978c50b74de4cd6587b36084" UNIQUE ("portfolio_id", "user_id")`);
                }
            }
        }

        // Check if maintenance_request table exists and has unit_id foreign key
        const hasMaintenanceRequestTable = await queryRunner.hasTable('maintenance_request');
        if (hasMaintenanceRequestTable) {
            const fkExists = await queryRunner.query(`
                SELECT 1 
                FROM information_schema.table_constraints 
                WHERE table_name = 'maintenance_request' 
                AND constraint_name = 'FK_7990604abb047d1e163e437fc6a'
            `);
            
            if (fkExists.length === 0) {
                // Check if unit_id column exists first
                const unitIdColumn = await queryRunner.query(`
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'maintenance_request' 
                    AND column_name = 'unit_id'
                `);
                
                if (unitIdColumn.length > 0) {
                    await queryRunner.query(`ALTER TABLE "maintenance_request" ADD CONSTRAINT "FK_7990604abb047d1e163e437fc6a" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
                }
            }
        }

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
        await queryRunner.query(`ALTER TABLE "maintenance_request" DROP CONSTRAINT "FK_7990604abb047d1e163e437fc6a"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_da309569f957adb1f09c8bb1095"`);
        await queryRunner.query(`ALTER TABLE "payment_application" DROP CONSTRAINT "FK_9c8c30c178ebe905e59077f84ab"`);
        await queryRunner.query(`ALTER TABLE "payment_application" DROP CONSTRAINT "FK_2b4fa2d71c82de59053aa0aca72"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6"`);
        await queryRunner.query(`ALTER TABLE "lease_charge" DROP CONSTRAINT "FK_05ec29a7dc2334ac370eb8719c0"`);
        await queryRunner.query(`ALTER TABLE "lease_charge" DROP CONSTRAINT "FK_cb383f9d3e410323aa5c7232cc7"`);
        await queryRunner.query(`ALTER TABLE "lease_charge" DROP CONSTRAINT "FK_4ecd198da30e9be7ae2c8ffe9db"`);
        await queryRunner.query(`ALTER TABLE "lease" DROP CONSTRAINT "FK_ca091675febe801029d4db0f642"`);
        await queryRunner.query(`ALTER TABLE "lease_tenant" DROP CONSTRAINT "FK_64b69371ab43b1453ba3e1229de"`);
        await queryRunner.query(`ALTER TABLE "lease_tenant" DROP CONSTRAINT "FK_1002d49fc6e6a01abf5308403c8"`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" DROP CONSTRAINT "FK_c02eecc90e0de3c1742116fefa7"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_5ec9aa64430984435e8a0262669"`);
        await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT "FK_ffd1df4d8c19a8bd49fcd8af71b"`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" DROP CONSTRAINT "UQ_c3f978c50b74de4cd6587b36084"`);
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
        await queryRunner.query(`CREATE INDEX "IDX_TENANT_PORTFOLIO_ID" ON "tenant" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_PORTFOLIO_USER_ID" ON "portfolio" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_PROPERTY_PORTFOLIO_ID" ON "property" ("portfolio_id") `);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_tenant_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio" ADD CONSTRAINT "FK_portfolio_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "property" ADD CONSTRAINT "FK_property_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
