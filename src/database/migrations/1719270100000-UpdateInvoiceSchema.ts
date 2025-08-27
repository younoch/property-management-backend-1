import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvoiceSchema1719270100000 implements MigrationInterface {
  name = 'UpdateInvoiceSchema1719270100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add check constraints for status transitions
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'CHK_invoice_status'
        ) THEN
          ALTER TABLE "invoice" 
          ADD CONSTRAINT "CHK_invoice_status" 
          CHECK (status IN ('draft', 'open', 'partially_paid', 'paid', 'void', 'overdue'));
        END IF;
      END
      $$;
    `);

    // Add index for faster status-based queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_invoice_status_due_date" 
      ON "invoice" ("status", "due_date");
    `);

    // Ensure items column has a default value if not set
    await queryRunner.query(`
      ALTER TABLE "invoice" 
      ALTER COLUMN "items" 
      SET DEFAULT '[]'::jsonb;
    `);

    // Update any null items to empty array
    await queryRunner.query(`
      UPDATE "invoice" 
      SET "items" = '[]'::jsonb 
      WHERE "items" IS NULL;
    `);

    // Make items column NOT NULL
    await queryRunner.query(`
      ALTER TABLE "invoice" 
      ALTER COLUMN "items" 
      SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the check constraint if it exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'CHK_invoice_status'
        ) THEN
          ALTER TABLE "invoice" 
          DROP CONSTRAINT "CHK_invoice_status";
        END IF;
      END
      $$;
    `);

    // Drop the index if it exists
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_invoice_status_due_date";
    `);
  }
}
