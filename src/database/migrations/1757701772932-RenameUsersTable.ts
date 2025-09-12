import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUsersTable1757701772932 implements MigrationInterface {
    name = 'RenameUsersTable1757701772932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the table is already named 'users'
        const tableExists = await queryRunner.hasTable('users');
        
        if (!tableExists) {
            // If users table doesn't exist but user table does, rename it
            const oldTableExists = await queryRunner.hasTable('user');
            if (oldTableExists) {
                // First, drop all foreign key constraints that reference the user table
                await queryRunner.query(`
                    ALTER TABLE "portfolio" 
                    DROP CONSTRAINT IF EXISTS "FK_ab77879067dc815468de31e63cf"
                `);
                
                await queryRunner.query(`
                    ALTER TABLE "notification" 
                    DROP CONSTRAINT IF EXISTS "FK_928b7aa1754e08e1ed7052cb9d8"
                `);
                
                await queryRunner.query(`
                    ALTER TABLE "portfolio_member" 
                    DROP CONSTRAINT IF EXISTS "FK_a2db3bb0a70771c7027c7309bff"
                `);
                
                // Rename the table
                await queryRunner.query(`ALTER TABLE "user" RENAME TO "users";`);
                
                // Recreate the foreign key constraints with the new table name
                await queryRunner.query(`
                    ALTER TABLE "portfolio" 
                    ADD CONSTRAINT "FK_ab77879067dc815468de31e63cf" 
                    FOREIGN KEY ("landlord_id") REFERENCES "users"("id") 
                    ON DELETE CASCADE ON UPDATE NO ACTION
                `);
                
                await queryRunner.query(`
                    ALTER TABLE "notification" 
                    ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") 
                    ON DELETE SET NULL ON UPDATE NO ACTION
                `);
                
                await queryRunner.query(`
                    ALTER TABLE "portfolio_member" 
                    ADD CONSTRAINT "FK_a2db3bb0a70771c7027c7309bff" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") 
                    ON DELETE CASCADE ON UPDATE NO ACTION
                `);
            }
        }
        // If the table is already named 'users', do nothing
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This is a one-way migration since the table is already correctly named
        // No need to implement the down migration as it would be destructive
    }
}
