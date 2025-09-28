import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchemaFix1759000000000 implements MigrationInterface {
    name = 'InitialSchemaFix1759000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Helper function to safely create tables
        const createTableIfNotExists = async (tableName: string, createQuery: string) => {
            const tableExists = await queryRunner.query(
                `SELECT to_regclass('${tableName}')`
            );
            if (!tableExists[0].to_regclass) {
                await queryRunner.query(createQuery);
                console.log(`Created table ${tableName}`);
            } else {
                console.log(`Table ${tableName} already exists, skipping creation`);
            }
        };

        // Create tables if they don't exist
        await createTableIfNotExists('portfolio', `
            CREATE TABLE IF NOT EXISTS "portfolio" (
                "id" SERIAL PRIMARY KEY,
                "name" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP
            )
        `);

        await createTableIfNotExists('property', `
            CREATE TABLE IF NOT EXISTS "property" (
                "id" SERIAL PRIMARY KEY,
                "portfolio_id" integer NOT NULL,
                "name" character varying NOT NULL,
                "address_line1" character varying,
                "address_line2" character varying,
                "city" character varying,
                "state" character varying,
                "zip_code" character varying,
                "country" character varying DEFAULT 'USA',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP
            )
        `);

        // Add foreign key constraint if it doesn't exist
        const fkExists = await queryRunner.query(
            `SELECT 1 FROM information_schema.table_constraints 
             WHERE table_name = 'property' 
             AND constraint_name = 'FK_property_portfolio'`
        );
        
        if (!fkExists || fkExists.length === 0) {
            await queryRunner.query(
                `ALTER TABLE "property" 
                 ADD CONSTRAINT "FK_property_portfolio" 
                 FOREIGN KEY ("portfolio_id") 
                 REFERENCES "portfolio"("id") 
                 ON DELETE CASCADE`
            );
        }

        await createTableIfNotExists('tenant', `
            CREATE TABLE IF NOT EXISTS "tenant" (
                "id" SERIAL PRIMARY KEY,
                "portfolio_id" integer NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "email" character varying,
                "phone" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP
            )
        `);

        // Add foreign key constraint if it doesn't exist
        const tenantFkExists = await queryRunner.query(
            `SELECT 1 FROM information_schema.table_constraints 
             WHERE table_name = 'tenant' 
             AND constraint_name = 'FK_tenant_portfolio'`
        );
        
        if (!tenantFkExists || tenantFkExists.length === 0) {
            await queryRunner.query(
                `ALTER TABLE "tenant" 
                 ADD CONSTRAINT "FK_tenant_portfolio" 
                 FOREIGN KEY ("portfolio_id") 
                 REFERENCES "portfolio"("id") 
                 ON DELETE CASCADE`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This is a fix migration, no need for down
        // We'll handle rollback in a separate migration if needed
        console.log('Skipping down migration for InitialSchemaFix1759000000000');
        return Promise.resolve();
    }
}
