import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanSchema1759000000002 implements MigrationInterface {
    name = 'CleanSchema1759000000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables with IF NOT EXISTS
        await this.createTables(queryRunner);
        // Add indexes
        await this.createIndexes(queryRunner);
        // Add foreign keys
        await this.addConstraints(queryRunner);
    }

    private async createTables(queryRunner: QueryRunner): Promise<void> {
        // Core tables
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "portfolio" ("id" SERIAL PRIMARY KEY, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP);`);
        
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "property" ("id" SERIAL PRIMARY KEY, "portfolio_id" integer NOT NULL, "name" character varying NOT NULL, "address_line1" character varying, "address_line2" character varying, "city" character varying, "state" character varying, "zip_code" character varying, "country" character varying DEFAULT 'USA', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP);`);
        
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "unit" ("id" SERIAL PRIMARY KEY, "property_id" integer NOT NULL, "label" character varying NOT NULL, "bedrooms" integer, "bathrooms" integer, "sqft" integer, "market_rent" numeric(12,2), "status" character varying NOT NULL DEFAULT 'vacant', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d16001384f6d95251d979076a57" UNIQUE ("property_id", "label"));`);
        
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "tenant" ("id" SERIAL PRIMARY KEY, "portfolio_id" integer NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying, "phone" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP);`);
        
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "lease" ("id" SERIAL PRIMARY KEY, "unit_id" integer NOT NULL, "start_date" date NOT NULL, "end_date" date, "monthly_rent" numeric(12,2) NOT NULL, "security_deposit" numeric(12,2) DEFAULT 0, "status" character varying NOT NULL DEFAULT 'draft', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP);`);
    }

    private async createIndexes(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_PROPERTY_PORTFOLIO_ID" ON "property" ("portfolio_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_UNIT_PROPERTY_ID" ON "unit" ("property_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_TENANT_PORTFOLIO_ID" ON "tenant" ("portfolio_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_LEASE_UNIT_ID" ON "lease" ("unit_id");`);
    }

    private async addConstraints(queryRunner: QueryRunner): Promise<void> {
        // Helper to safely add foreign keys
        const addFk = async (table: string, column: string, refTable: string, fkName: string, onDelete = 'NO ACTION') => {
            const exists = await queryRunner.query(
                `SELECT 1 FROM information_schema.table_constraints WHERE table_name = '${table}' AND constraint_name = '${fkName}'`
            );
            if (!exists?.length) {
                await queryRunner.query(
                    `ALTER TABLE "${table}" ADD CONSTRAINT "${fkName}" FOREIGN KEY ("${column}") REFERENCES "${refTable}"("id") ON DELETE ${onDelete};`
                );
            }
        };

        // Add foreign keys
        await addFk('property', 'portfolio_id', 'portfolio', 'FK_property_portfolio', 'CASCADE');
        await addFk('unit', 'property_id', 'property', 'FK_unit_property', 'CASCADE');
        await addFk('tenant', 'portfolio_id', 'portfolio', 'FK_tenant_portfolio', 'CASCADE');
        await addFk('lease', 'unit_id', 'unit', 'FK_lease_unit', 'RESTRICT');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Skip down migration to prevent data loss
        console.log('Skipping down migration to prevent data loss');
        return Promise.resolve();
    }
}
