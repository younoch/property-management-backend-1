import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFeedbackTableNullableUserId1757232000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "user_feedback" 
      DROP CONSTRAINT "FK_e4cc25c220dea064df29485e39a"
    `);
    
    // Make the column nullable and remove default
    await queryRunner.query(`
      ALTER TABLE "user_feedback" 
      ALTER COLUMN "userId" DROP NOT NULL,
      ALTER COLUMN "userId" DROP DEFAULT
    `);
    
    // Recreate the foreign key with ON DELETE SET NULL
    await queryRunner.query(`
      ALTER TABLE "user_feedback"
      ADD CONSTRAINT "FK_e4cc25c220dea064df29485e39a" 
      FOREIGN KEY ("userId") 
      REFERENCES "user"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First, delete any feedback without a user
    await queryRunner.query(`
      DELETE FROM "user_feedback" WHERE "userId" IS NULL
    `);

    // Drop the existing foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "user_feedback" 
      DROP CONSTRAINT "FK_e4cc25c220dea064df29485e39a"
    `);
    
    // Make the column required
    await queryRunner.query(`
      ALTER TABLE "user_feedback" 
      ALTER COLUMN "userId" SET NOT NULL
    `);
    
    // Recreate the foreign key with ON DELETE CASCADE
    await queryRunner.query(`
      ALTER TABLE "user_feedback"
      ADD CONSTRAINT "FK_e4cc25c220dea064df29485e39a" 
      FOREIGN KEY ("userId") 
      REFERENCES "user"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);
  }
}
