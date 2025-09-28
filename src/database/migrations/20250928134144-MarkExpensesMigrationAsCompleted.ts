import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarkExpensesMigrationAsCompleted20250928134144 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration is a no-op because the table already exists
    // It's just here to mark the migration as completed in the migrations table
    console.log('Expenses table already exists. Marking migration as completed.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This is a safe down migration that won't drop the table
    console.log('Skipping table drop in down migration to prevent data loss');
  }
}
