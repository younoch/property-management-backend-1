import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759976895099 implements MigrationInterface {
    name = 'InitialSchema1759976895099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // property.postal_code -> property.zip_code (only if the table/column exist)
        if (await queryRunner.hasTable('property')) {
            const hasPostalCode = await queryRunner.hasColumn('property', 'postal_code');
            const hasZipCode = await queryRunner.hasColumn('property', 'zip_code');
            if (hasPostalCode && !hasZipCode) {
                await queryRunner.query(`ALTER TABLE "property" RENAME COLUMN "postal_code" TO "zip_code"`);
            }
        }

        // Ensure enum type exists before using it
        await queryRunner.query(`DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'units_status_enum') THEN
                CREATE TYPE "public"."units_status_enum" AS ENUM('vacant', 'occupied', 'maintenance');
            END IF;
        END$$;`);

        // Update units.status to enum defaulting to 'vacant' if units table exists
        if (await queryRunner.hasTable('units')) {
            const hasStatus = await queryRunner.hasColumn('units', 'status');
            if (hasStatus) {
                // Drop existing status to recreate with enum type
                await queryRunner.query(`ALTER TABLE "units" DROP COLUMN "status"`);
            }
            await queryRunner.query(`ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "status" "public"."units_status_enum" NOT NULL DEFAULT 'vacant'`);
        }

        // Make sure invoices.items default is jsonb array if invoices table exists
        if (await queryRunner.hasTable('invoices')) {
            await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert invoices.items default back to text '[]' if invoices table exists
        if (await queryRunner.hasTable('invoices')) {
            await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        }

        // Revert units.status back to varchar and drop enum if possible
        if (await queryRunner.hasTable('units')) {
            const hasStatus = await queryRunner.hasColumn('units', 'status');
            if (hasStatus) {
                await queryRunner.query(`ALTER TABLE "units" DROP COLUMN "status"`);
            }
            await queryRunner.query(`ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "status" character varying NOT NULL DEFAULT 'vacant'`);
        }
        // Drop enum type if it exists and no longer used
        await queryRunner.query(`DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'units_status_enum') THEN
                -- Attempt to drop the type; if still in use, this will error, so guard it
                BEGIN
                    EXECUTE 'DROP TYPE "public"."units_status_enum"';
                EXCEPTION WHEN dependent_objects_still_exist THEN
                    -- Ignore if type is still referenced
                    NULL;
                END;
            END IF;
        END$$;`);

        // property.zip_code -> property.postal_code (only if property table exists)
        if (await queryRunner.hasTable('property')) {
            const hasZipCode = await queryRunner.hasColumn('property', 'zip_code');
            const hasPostalCode = await queryRunner.hasColumn('property', 'postal_code');
            if (hasZipCode && !hasPostalCode) {
                await queryRunner.query(`ALTER TABLE "property" RENAME COLUMN "zip_code" TO "postal_code"`);
            }
        }
    }

}

