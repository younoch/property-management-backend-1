import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvoiceTimestampsToUTC1717928000000 implements MigrationInterface {
    name = 'UpdateInvoiceTimestampsToUTC1717928000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Update timestamps to ensure they're in UTC
            UPDATE invoices 
            SET 
                created_at = created_at AT TIME ZONE 'UTC',
                updated_at = updated_at AT TIME ZONE 'UTC',
                deleted_at = CASE WHEN deleted_at IS NULL THEN NULL ELSE deleted_at AT TIME ZONE 'UTC' END,
                sent_at = CASE WHEN sent_at IS NULL THEN NULL ELSE sent_at AT TIME ZONE 'UTC' END,
                paid_at = CASE WHEN paid_at IS NULL THEN NULL ELSE paid_at AT TIME ZONE 'UTC' END,
                voided_at = CASE WHEN voided_at IS NULL THEN NULL ELSE voided_at AT TIME ZONE 'UTC' END
            WHERE 
                created_at IS NOT NULL 
                OR updated_at IS NOT NULL 
                OR deleted_at IS NOT NULL
                OR sent_at IS NOT NULL
                OR paid_at IS NOT NULL
                OR voided_at IS NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No need to revert as we're just ensuring UTC timezone
        // and not changing the fundamental data
    }
}
