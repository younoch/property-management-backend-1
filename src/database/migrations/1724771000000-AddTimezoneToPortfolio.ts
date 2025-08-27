import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimezoneToPortfolio1724771000000 implements MigrationInterface {
    name = 'AddTimezoneToPortfolio1724771000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add timezone column with a default value of 'UTC'
        await queryRunner.query(`
            ALTER TABLE "portfolio" 
            ADD COLUMN IF NOT EXISTS "timezone" character varying NOT NULL DEFAULT 'UTC';
        `);

        // Create an index for the timezone column if needed for queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_portfolio_timezone" 
            ON "portfolio" ("timezone");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index first
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_portfolio_timezone";
        `);

        // Remove the timezone column
        await queryRunner.query(`
            ALTER TABLE "portfolio" 
            DROP COLUMN IF EXISTS "timezone";
        `);
    }
}
