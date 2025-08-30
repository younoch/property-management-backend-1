import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentLeaseCascade1756547414595 implements MigrationInterface {
    name = 'UpdatePaymentLeaseCascade1756547414595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "payment" 
            DROP CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6"
        `);

        // Recreate the foreign key with CASCADE on delete
        await queryRunner.query(`
            ALTER TABLE "payment" 
            ADD CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6" 
            FOREIGN KEY ("lease_id") 
            REFERENCES "lease"("id") 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to RESTRICT on delete
        await queryRunner.query(`
            ALTER TABLE "payment" 
            DROP CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6"
        `);

        await queryRunner.query(`
            ALTER TABLE "payment" 
            ADD CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6" 
            FOREIGN KEY ("lease_id") 
            REFERENCES "lease"("id")
            ON DELETE RESTRICT
        `);
    }
}
