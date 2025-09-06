import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnitAndPropertyToLeaseChargeSimple1757146000000 implements MigrationInterface {
    name = 'AddUnitAndPropertyToLeaseChargeSimple1757146000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add unit_id column
        await queryRunner.query(`
            DO $$
            BEGIN
                BEGIN
                    ALTER TABLE "lease_charge" ADD COLUMN "unit_id" integer;
                    CREATE INDEX "IDX_lease_charge_unit_id" ON "lease_charge" ("unit_id");
                    ALTER TABLE "lease_charge" ADD CONSTRAINT "FK_lease_charge_unit" 
                        FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                EXCEPTION
                    WHEN duplicate_column THEN 
                        RAISE NOTICE 'column unit_id already exists in lease_charge';
                END;
                
                BEGIN
                    ALTER TABLE "lease_charge" ADD COLUMN "property_id" integer;
                    CREATE INDEX "IDX_lease_charge_property_id" ON "lease_charge" ("property_id");
                    ALTER TABLE "lease_charge" ADD CONSTRAINT "FK_lease_charge_property" 
                        FOREIGN KEY ("property_id") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                EXCEPTION
                    WHEN duplicate_column THEN 
                        RAISE NOTICE 'column property_id already exists in lease_charge';
                END;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                BEGIN
                    ALTER TABLE "lease_charge" DROP CONSTRAINT IF EXISTS "FK_lease_charge_unit";
                    DROP INDEX IF EXISTS "IDX_lease_charge_unit_id";
                    ALTER TABLE "lease_charge" DROP COLUMN IF EXISTS "unit_id";
                EXCEPTION
                    WHEN undefined_column THEN 
                        RAISE NOTICE 'column unit_id does not exist in lease_charge';
                END;
                
                BEGIN
                    ALTER TABLE "lease_charge" DROP CONSTRAINT IF EXISTS "FK_lease_charge_property";
                    DROP INDEX IF EXISTS "IDX_lease_charge_property_id";
                    ALTER TABLE "lease_charge" DROP COLUMN IF EXISTS "property_id";
                EXCEPTION
                    WHEN undefined_column THEN 
                        RAISE NOTICE 'column property_id does not exist in lease_charge';
                END;
            END $$;
        `);
    }
}
