import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759001247003 implements MigrationInterface {
    name = 'InitialSchema1759001247003'

    // Helper function to safely create tables
    private async createTableIfNotExists(queryRunner: QueryRunner, tableName: string, createQuery: string): Promise<void> {
        const tableExists = await queryRunner.query(
            `SELECT to_regclass('${tableName}')`
        );
        if (!tableExists[0].to_regclass) {
            await queryRunner.query(createQuery);
            console.log(`Created table ${tableName}`);
        } else {
            console.log(`Table ${tableName} already exists, skipping creation`);
        }
    }

    // Helper function to safely add foreign key
    private async addForeignKeyIfNotExists(
        queryRunner: QueryRunner,
        table: string,
        column: string,
        referencedTable: string,
        constraintName: string,
        onDelete: string = 'NO ACTION',
        onUpdate: string = 'NO ACTION'
    ): Promise<void> {
        try {
            const constraintExists = await queryRunner.query(
                `SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = '${table}' 
                 AND constraint_name = '${constraintName}'`
            );
            
            if (!constraintExists || constraintExists.length === 0) {
                // First, check if the column exists
                const columnExists = await queryRunner.query(
                    `SELECT 1 FROM information_schema.columns 
                     WHERE table_name = '${table}' 
                     AND column_name = '${column}'`
                );
                
                if (columnExists && columnExists.length > 0) {
                    await queryRunner.query(`
                        ALTER TABLE "${table}" 
                        ADD CONSTRAINT "${constraintName}" 
                        FOREIGN KEY ("${column}") 
                        REFERENCES "${referencedTable}"("id") 
                        ON DELETE ${onDelete} 
                        ON UPDATE ${onUpdate};
                    `);
                    console.log(`Added constraint ${constraintName} on ${table}.${column}`);
                } else {
                    console.log(`Column ${table}.${column} does not exist, skipping constraint ${constraintName}`);
                }
            } else {
                console.log(`Constraint ${constraintName} already exists, skipping`);
            }
        } catch (error) {
            console.error(`Error adding constraint ${constraintName} on ${table}.${column}:`, error.message);
            // Continue with other constraints even if one fails
        }
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Helper function to create index if it doesn't exist
        const createIndexIfNotExists = async (table: string, indexName: string, columns: string, whereClause: string = '') => {
            const indexExists = await queryRunner.query(
                `SELECT 1 FROM pg_indexes WHERE indexname = '${indexName}'`
            );
            if (!indexExists || indexExists.length === 0) {
                const where = whereClause ? ` WHERE ${whereClause}` : '';
                await queryRunner.query(`CREATE INDEX "${indexName}" ON "${table}" (${columns})${where}`);
                console.log(`Created index ${indexName} on ${table}`);
            } else {
                console.log(`Index ${indexName} already exists, skipping`);
            }
        };

        // Create unit table
        await this.createTableIfNotExists(queryRunner, 'unit', `
            CREATE TABLE IF NOT EXISTS "unit" (
                "id" SERIAL NOT NULL, 
                "property_id" integer NOT NULL, 
                "label" character varying NOT NULL, 
                "bedrooms" integer, 
                "bathrooms" integer, 
                "sqft" integer, 
                "market_rent" numeric(12,2), 
                "status" character varying NOT NULL DEFAULT 'vacant', 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                CONSTRAINT "UQ_d16001384f6d95251d979076a57" UNIQUE ("property_id", "label"), 
                CONSTRAINT "PK_4252c4be609041e559f0c80f58a" PRIMARY KEY ("id")
            )`);

        // Create unit index
        await createIndexIfNotExists('unit', 'IDX_ffd1df4d8c19a8bd49fcd8af71', 'property_id');

        // Create lease_tenant table
        await this.createTableIfNotExists(queryRunner, 'lease_tenant', `
            CREATE TABLE IF NOT EXISTS "lease_tenant" (
                "lease_id" integer NOT NULL, 
                "tenant_id" integer NOT NULL, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                "is_primary" boolean NOT NULL DEFAULT false, 
                "moved_in_date" date, 
                "moved_out_date" date, 
                "relationship" character varying(255), 
                CONSTRAINT "PK_b5f56ce129b079a8b45f3250081" PRIMARY KEY ("lease_id", "tenant_id")
            )`);

        // Create lease_tenant index
        await createIndexIfNotExists('lease_tenant', 'IDX_2ba7f599a8c3548cf23efa7421', 'lease_id, is_primary', 'is_primary = true');

        // Create lease table
        await this.createTableIfNotExists(queryRunner, 'lease', `
            CREATE TABLE IF NOT EXISTS "lease" (
                "id" SERIAL NOT NULL, 
                "unit_id" integer NOT NULL, 
                "start_date" date NOT NULL, 
                "end_date" date NOT NULL, 
                "rent" numeric(12,2) NOT NULL, 
                "deposit" numeric(12,2) NOT NULL DEFAULT '0', 
                "billing_day" integer, 
                "grace_days" integer, 
                "late_fee_flat" numeric(12,2), 
                "late_fee_percent" numeric(5,2), 
                "notes" text, 
                "status" character varying NOT NULL DEFAULT 'draft', 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                CONSTRAINT "PK_954811694773f24986695203663" PRIMARY KEY ("id")
            )`);

        // Create lease indices
        await createIndexIfNotExists('lease', 'IDX_f11320558c167027aa972c92bf', 'status');
        await createIndexIfNotExists('lease', 'IDX_ca091675febe801029d4db0f64', 'unit_id');

        // Create lease_charge table
        await this.createTableIfNotExists(queryRunner, 'lease_charge', `
            CREATE TABLE IF NOT EXISTS "lease_charge" (
                "id" SERIAL NOT NULL, 
                "lease_id" integer NOT NULL, 
                "name" character varying NOT NULL, 
                "unit_id" integer NOT NULL, 
                "property_id" integer NOT NULL, 
                "amount" numeric(12,2) NOT NULL, 
                "cadence" character varying NOT NULL DEFAULT 'monthly', 
                "start_date" date NOT NULL, 
                "end_date" date, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                CONSTRAINT "PK_09772a7297c9b7a7e1300be76ba" PRIMARY KEY ("id")
            )`);

        // Create lease_charge indices
        await createIndexIfNotExists('lease_charge', 'IDX_05ec29a7dc2334ac370eb8719c', 'property_id');
        await createIndexIfNotExists('lease_charge', 'IDX_cb383f9d3e410323aa5c7232cc', 'unit_id');
        await createIndexIfNotExists('lease_charge', 'IDX_4ecd198da30e9be7ae2c8ffe9d', 'lease_id');

        // Create payment table
        await this.createTableIfNotExists(queryRunner, 'payment', `
            CREATE TABLE IF NOT EXISTS "payment" (
                "id" SERIAL NOT NULL, 
                "lease_id" integer NOT NULL, 
                "amount" numeric(12,2) NOT NULL, 
                "unapplied_amount" numeric(12,2) NOT NULL DEFAULT '0', 
                "method" "public"."payment_method_enum" NOT NULL DEFAULT 'cash', 
                "at" date NOT NULL, 
                "reference" character varying, 
                "notes" text, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id")
            )`);

        // Create payment index
        await createIndexIfNotExists('payment', 'IDX_2d5167c4ef1c8ab3342ac3d05e', 'lease_id');

        // Create invoices table
        await this.createTableIfNotExists(queryRunner, 'invoices', `
            CREATE TABLE IF NOT EXISTS "invoices" (
                "id" SERIAL NOT NULL, 
                "lease_id" integer, 
                "invoice_number" character varying(50) NOT NULL, 
                "issue_date" date NOT NULL DEFAULT ('now'::text)::date, 
                "due_date" date, 
                "grace_days" integer NOT NULL DEFAULT 0, 
                "subtotal" numeric(12,2) NOT NULL DEFAULT 0, 
                "tax_rate" numeric(5,2) NOT NULL DEFAULT 0, 
                "tax_amount" numeric(12,2) NOT NULL DEFAULT 0, 
                "total_amount" numeric(12,2) NOT NULL DEFAULT 0, 
                "amount_paid" numeric(12,2) NOT NULL DEFAULT 0, 
                "balance_due" numeric(12,2) NOT NULL DEFAULT 0, 
                "billing_month" character varying(7) NOT NULL, 
                "period_start" date NOT NULL, 
                "period_end" date NOT NULL, 
                "status" character varying(20) NOT NULL DEFAULT 'draft', 
                "notes" text, 
                "terms" text, 
                "sent_at" TIMESTAMP WITH TIME ZONE, 
                "paid_at" TIMESTAMP WITH TIME ZONE, 
                "voided_at" TIMESTAMP WITH TIME ZONE, 
                "metadata" jsonb, 
                "is_issued" boolean NOT NULL DEFAULT false, 
                "items" jsonb NOT NULL DEFAULT '[]'::jsonb, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE, 
                CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE ("invoice_number"), 
                CONSTRAINT "PK_a27abf1a7a1c9e1aae8c8c8c8c8" PRIMARY KEY ("id")
            )`);

        // Create invoice indices
        await createIndexIfNotExists('invoices', 'IDX_5721da3283cc742b1db3427e08', 'lease_id, billing_month', `status != 'void'`);
        await createIndexIfNotExists('invoices', 'IDX_298cb55cdf1a44fbcb097fdf69', 'status, due_date', '');
        await createIndexIfNotExists('invoices', 'IDX_0457ee681a50419881ea2ee796', 'due_date', '');
        await createIndexIfNotExists('invoices', 'IDX_da309569f957adb1f09c8bb109', 'lease_id', '');

        // Create payment_application table
        await this.createTableIfNotExists(queryRunner, 'payment_application', `
            CREATE TABLE IF NOT EXISTS "payment_application" (
                "id" SERIAL NOT NULL, 
                "payment_id" integer NOT NULL, 
                "invoice_id" integer NOT NULL, 
                "amount_applied" numeric(12,2) NOT NULL, 
                "applied_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP, 
                CONSTRAINT "PK_1f1a8a9b9e9e9e9e9e9e9e9e9" PRIMARY KEY ("id")
            )`);

        // Create payment_application indices
        await createIndexIfNotExists('payment_application', 'IDX_payment_application_payment_id', 'payment_id');
        await createIndexIfNotExists('payment_application', 'IDX_payment_application_invoice_id', 'invoice_id');

        // Add foreign keys using the class method
        await this.addForeignKeyIfNotExists(queryRunner, 'unit', 'property_id', 'property', 'FK_unit_property', 'CASCADE');
        await this.addForeignKeyIfNotExists(queryRunner, 'lease', 'unit_id', 'unit', 'FK_lease_unit', 'RESTRICT');
        await this.addForeignKeyIfNotExists(queryRunner, 'lease_tenant', 'lease_id', 'lease', 'FK_lease_tenant_lease', 'CASCADE');
        await this.addForeignKeyIfNotExists(queryRunner, 'lease_tenant', 'tenant_id', 'tenant', 'FK_lease_tenant_tenant', 'RESTRICT');
        await this.addForeignKeyIfNotExists(queryRunner, 'lease_charge', 'lease_id', 'lease', 'FK_lease_charge_lease', 'CASCADE');
        await this.addForeignKeyIfNotExists(queryRunner, 'lease_charge', 'unit_id', 'unit', 'FK_lease_charge_unit', 'CASCADE');
        await this.addForeignKeyIfNotExists(queryRunner, 'lease_charge', 'property_id', 'property', 'FK_lease_charge_property', 'CASCADE');
        await this.addForeignKeyIfNotExists(queryRunner, 'payment', 'lease_id', 'lease', 'FK_payment_lease', 'RESTRICT');
        await this.addForeignKeyIfNotExists(queryRunner, 'invoices', 'lease_id', 'lease', 'FK_invoice_lease', 'SET NULL');
        await this.addForeignKeyIfNotExists(queryRunner, 'payment_application', 'payment_id', 'payment', 'FK_payment_application_payment', 'CASCADE');
        await this.addForeignKeyIfNotExists(queryRunner, 'payment_application', 'invoice_id', 'invoices', 'FK_payment_application_invoice', 'CASCADE');
        
        // Add portfolio-related foreign keys if the tables exist
        try {
            await this.addForeignKeyIfNotExists(queryRunner, 'notification', 'portfolio_id', 'portfolio', 'FK_notification_portfolio', 'CASCADE');
        } catch (error) {
            console.log('Skipping notification.portfolio_id foreign key - notification table might not exist');
        }
        
        try {
            await this.addForeignKeyIfNotExists(queryRunner, 'portfolio_member', 'portfolio_id', 'portfolio', 'FK_portfolio_member_portfolio', 'CASCADE');
        } catch (error) {
            console.log('Skipping portfolio_member.portfolio_id foreign key - portfolio_member table might not exist');
        }
        
        try {
            await this.addForeignKeyIfNotExists(queryRunner, 'maintenance_request', 'unit_id', 'unit', 'FK_maintenance_request_unit', 'SET NULL');
        } catch (error) {
            console.log('Skipping maintenance_request.unit_id foreign key - maintenance_request table might not exist');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Skip dropping tables in down migration to prevent data loss
        // This is a one-way migration to fix the production database
        // If you need to rollback, create a new migration with proper down logic
        console.log('Skipping down migration to prevent data loss');
        return Promise.resolve();
    }

}
