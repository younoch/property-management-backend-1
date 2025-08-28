import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddBillingPeriodUniqueness1724772100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, clean up any potential duplicates
    await queryRunner.query(`
      DELETE FROM invoice i1
      USING invoice i2
      WHERE 
        i1.id > i2.id AND 
        i1.lease_id = i2.lease_id AND 
        i1.period_start = i2.period_start AND
        i1.period_end = i2.period_end;
    `);

    // Create a unique index on lease_id and billing period
    await queryRunner.createIndex(
      'invoice',
      new TableIndex({
        name: 'IDX_invoice_lease_billing_period',
        columnNames: ['lease_id', 'period_start', 'period_end'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index
    await queryRunner.dropIndex('invoice', 'IDX_invoice_lease_billing_period');
  }
}
