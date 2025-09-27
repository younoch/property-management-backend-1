import { MigrationInterface, QueryRunner } from "typeorm";

export class FixLeaseChargeConstraint1759058558001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the constraint exists before trying to drop it
        const constraintExists = await queryRunner.query(`
            SELECT 1
            FROM information_schema.table_constraints
            WHERE constraint_name = 'FK_lease_charge_portfolio_id'
            AND table_name = 'lease_charge'
        `);

        if (constraintExists && constraintExists.length > 0) {
            await queryRunner.query(`
                ALTER TABLE "lease_charge" 
                DROP CONSTRAINT "FK_lease_charge_portfolio_id"
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This is the reverse operation - add the constraint back if needed
        await queryRunner.query(`
            ALTER TABLE "lease_charge" 
            ADD CONSTRAINT "FK_lease_charge_portfolio_id" 
            FOREIGN KEY ("portfolio_id") 
            REFERENCES "portfolio"("id") 
            ON DELETE CASCADE
        `);
    }
}
