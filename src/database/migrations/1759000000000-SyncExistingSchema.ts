import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncExistingSchema1759000000000 implements MigrationInterface {
    name = 'SyncExistingSchema1759000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration is a no-op because the tables already exist
        // It's just used to mark the current schema as the baseline
        console.log('Skipping table creation - using existing schema');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No need to do anything in down as this is just a sync migration
    }
}
