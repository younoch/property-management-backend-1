import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class UpdateLeaseTenantTable1724772000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "lease_tenant" 
      ADD COLUMN IF NOT EXISTS "is_primary" boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "moved_in_date" date,
      ADD COLUMN IF NOT EXISTS "moved_out_date" date,
      ADD COLUMN IF NOT EXISTS "relationship" varchar(255);
    `);

    // Create a partial unique index to ensure only one primary tenant per lease
    await queryRunner.createIndex(
      'lease_tenant',
      new TableIndex({
        name: 'IDX_lease_tenant_lease_primary',
        columnNames: ['lease_id', 'is_primary'],
        isUnique: true,
        where: 'is_primary = true',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index
    await queryRunner.dropIndex('lease_tenant', 'IDX_lease_tenant_lease_primary');
    
    // Drop the columns
    await queryRunner.query(`
      ALTER TABLE "lease_tenant" 
      DROP COLUMN IF EXISTS "is_primary",
      DROP COLUMN IF EXISTS "moved_in_date",
      DROP COLUMN IF EXISTS "moved_out_date",
      DROP COLUMN IF EXISTS "relationship";
    `);
  }
}
