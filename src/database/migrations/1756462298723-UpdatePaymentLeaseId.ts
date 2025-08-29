import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentLeaseId1756462298723 implements MigrationInterface {
    name = 'UpdatePaymentLeaseId1756462298723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, check if there are any payments with null lease_id
        const result = await queryRunner.query(`SELECT id FROM "payment" WHERE "lease_id" IS NULL`);
        
        if (result && result.length > 0) {
            // Get a valid lease_id to use as default
            const defaultLease = await queryRunner.query(`SELECT id FROM "lease" LIMIT 1`);
            
            if (defaultLease && defaultLease.length > 0) {
                const defaultLeaseId = defaultLease[0].id;
                console.log(`Found ${result.length} payments with null lease_id. Updating to lease_id: ${defaultLeaseId}`);
                
                // Update all payments with null lease_id to use the default lease
                await queryRunner.query(
                    `UPDATE "payment" SET "lease_id" = $1 WHERE "lease_id" IS NULL`,
                    [defaultLeaseId]
                );
            } else {
                throw new Error('No leases found in the database. Please create a lease first.');
            }
        }

        // Now alter the column to be NOT NULL
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "lease_id" SET NOT NULL`);
        
        // Update the foreign key constraint to use RESTRICT on delete
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6"`);
        await queryRunner.query(
            `ALTER TABLE "payment" ADD CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6" ` +
            `FOREIGN KEY ("lease_id") REFERENCES "lease"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the foreign key constraint to allow NULL
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6"`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "lease_id" DROP NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "payment" ADD CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6" ` +
            `FOREIGN KEY ("lease_id") REFERENCES "lease"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
        );
    }
}
