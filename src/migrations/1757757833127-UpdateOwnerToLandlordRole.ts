import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOwnerToLandlordRole1757757833127 implements MigrationInterface {
    name = 'UpdateOwnerToLandlordRole1757757833127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update portfolio_member table
        await queryRunner.query(`
            UPDATE "portfolio_member" 
            SET "role" = 'landlord' 
            WHERE "role" = 'owner';
        `);

        // Update any other tables that might reference the old role
        await queryRunner.query(`
            ALTER TABLE "portfolio_member" 
            DROP CONSTRAINT IF EXISTS "CHK_portfolio_member_role";
        `);

        await queryRunner.query(`
            ALTER TABLE "portfolio_member"
            ADD CONSTRAINT "CHK_portfolio_member_role" 
            CHECK ("role" IN ('admin', 'manager', 'landlord', 'viewer'));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the changes if needed
        await queryRunner.query(`
            UPDATE "portfolio_member" 
            SET "role" = 'owner' 
            WHERE "role" = 'landlord';
        `);

        await queryRunner.query(`
            ALTER TABLE "portfolio_member" 
            DROP CONSTRAINT IF EXISTS "CHK_portfolio_member_role";
        `);

        await queryRunner.query(`
            ALTER TABLE "portfolio_member"
            ADD CONSTRAINT "CHK_portfolio_member_role" 
            CHECK ("role" IN ('admin', 'manager', 'owner', 'viewer'));
        `);
    }
}
