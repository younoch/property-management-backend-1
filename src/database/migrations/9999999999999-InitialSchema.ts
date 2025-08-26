
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema9999999999999 implements MigrationInterface {
    name = 'InitialSchema9999999999999';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables safely with existence checks
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "portfolio" (
                "id" SERIAL PRIMARY KEY,
                "name" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "provider_customer_id" character varying,
                "default_status" character varying DEFAULT 'active'::character varying
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "lease" (
                "id" SERIAL PRIMARY KEY,
                "start_date" date NOT NULL,
                "end_date" date,
                "monthly_rent" numeric(12,2) NOT NULL,
                "security_deposit" numeric(12,2),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "portfolio_id" integer REFERENCES "portfolio"("id") ON DELETE CASCADE
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "invoice" (
                "id" SERIAL PRIMARY KEY,
                "issue_date" date NOT NULL,
                "due_date" date NOT NULL,
                "status" character varying NOT NULL DEFAULT 'draft',
                "subtotal" numeric(12,2) NOT NULL,
                "tax" numeric(12,2) NOT NULL DEFAULT 0,
                "total" numeric(12,2) NOT NULL,
                "balance" numeric(12,2) NOT NULL,
                "items" jsonb NOT NULL DEFAULT '[]',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "portfolio_id" integer REFERENCES "portfolio"("id") ON DELETE CASCADE,
                "lease_id" integer REFERENCES "lease"("id") ON DELETE SET NULL
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "payment" (
                "id" SERIAL PRIMARY KEY,
                "amount" numeric(12,2) NOT NULL,
                "method" character varying NOT NULL,
                "reference" character varying,
                "at" date NOT NULL,
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "portfolio_id" integer REFERENCES "portfolio"("id") ON DELETE CASCADE,
                "lease_id" integer REFERENCES "lease"("id") ON DELETE SET NULL
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "payment_application" (
                "payment_id" integer NOT NULL,
                "invoice_id" integer NOT NULL,
                "amount" numeric(12,2) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                PRIMARY KEY ("payment_id", "invoice_id"),
                FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE CASCADE,
                FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE
            );
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_payment_portfolio" ON "payment" ("portfolio_id");
            CREATE INDEX IF NOT EXISTS "IDX_payment_lease" ON "payment" ("lease_id");
            CREATE INDEX IF NOT EXISTS "IDX_invoice_portfolio" ON "invoice" ("portfolio_id");
            CREATE INDEX IF NOT EXISTS "IDX_invoice_lease" ON "invoice" ("lease_id");
            CREATE INDEX IF NOT EXISTS "IDX_invoice_due_date" ON "invoice" ("due_date");
            CREATE INDEX IF NOT EXISTS "IDX_payment_application_payment" ON "payment_application" ("payment_id");
            CREATE INDEX IF NOT EXISTS "IDX_payment_application_invoice" ON "payment_application" ("invoice_id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order of creation
        await queryRunner.query(`DROP TABLE IF EXISTS "payment_application" CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS "payment" CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS "invoice" CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS "lease" CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS "portfolio" CASCADE;`);
    }
}
