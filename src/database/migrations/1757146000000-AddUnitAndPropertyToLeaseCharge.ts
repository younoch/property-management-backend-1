import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnitAndPropertyToLeaseCharge1757146000000 implements MigrationInterface {
    name = 'AddUnitAndPropertyToLeaseCharge1757146000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add unit_id column
        await queryRunner.query(`
            ALTER TABLE "lease_charge" 
            ADD COLUMN IF NOT EXISTS "unit_id" integer,
            ADD COLUMN IF NOT EXISTS "property_id" integer;
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_lease_charge_unit_id" ON "lease_charge" ("unit_id");
            CREATE INDEX IF NOT EXISTS "IDX_lease_charge_property_id" ON "lease_charge" ("property_id");
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'FK_lease_charge_unit'
                ) THEN
                    ALTER TABLE "lease_charge" 
                    ADD CONSTRAINT "FK_lease_charge_unit" 
                    FOREIGN KEY ("unit_id") 
                    REFERENCES "unit"("id") 
                    ON DELETE CASCADE 
                    ON UPDATE NO ACTION;
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'FK_lease_charge_property'
                ) THEN
                    ALTER TABLE "lease_charge" 
                    ADD CONSTRAINT "FK_lease_charge_property" 
                    FOREIGN KEY ("property_id") 
                    REFERENCES "property"("id") 
                    ON DELETE CASCADE 
                    ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "lease_charge" 
            DROP CONSTRAINT IF EXISTS "FK_lease_charge_unit",
            DROP CONSTRAINT IF EXISTS "FK_lease_charge_property";
        `);

        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_lease_charge_unit_id";
            DROP INDEX IF EXISTS "IDX_lease_charge_property_id";
        `);

        // Drop columns
        await queryRunner.query(`
            ALTER TABLE "lease_charge" 
            DROP COLUMN IF EXISTS "unit_id",
            DROP COLUMN IF EXISTS "property_id";
        `);
    }
}
