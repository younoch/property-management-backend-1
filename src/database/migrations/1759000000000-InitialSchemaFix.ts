import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchemaFix1759000000000 implements MigrationInterface {
    name = 'InitialSchemaFix1759000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables first
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "portfolio" (
                "id" SERIAL PRIMARY KEY,
                "name" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP
            )
        `);

        await queryRunner.query(`
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
                "deleted_at" TIMESTAMP,
                CONSTRAINT "FK_property_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tenant" (
                "id" SERIAL PRIMARY KEY,
                "portfolio_id" integer NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "email" character varying,
                "phone" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "FK_tenant_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "tenant"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "property"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "portfolio"`);
    }
}
