import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePortfolioRelations1759058558000 implements MigrationInterface {
    name = 'RemovePortfolioRelations1759058558000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Helper function to safely drop a constraint if it exists
        const dropConstraintIfExists = async (table: string, constraint: string) => {
            const constraintExists = await queryRunner.query(`
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = '${table}' AND constraint_name = '${constraint}'
            `);
            if (constraintExists && constraintExists.length > 0) {
                await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT "${constraint}"`);
                console.log(`Dropped constraint ${constraint} from ${table}`);
            } else {
                console.log(`Constraint ${constraint} does not exist on ${table}, skipping`);
            }
        };

        // Drop foreign key constraints if they exist
        await dropConstraintIfExists('lease_charge', 'FK_lease_charge_portfolio_id');
        await dropConstraintIfExists('payment', 'FK_payment_portfolio_id');
        await dropConstraintIfExists('maintenance_request', 'FK_maintenance_request_portfolio_id');
        await dropConstraintIfExists('work_order', 'FK_work_order_portfolio_id');
        await dropConstraintIfExists('document', 'FK_document_portfolio_id');

        // Helper function to safely drop a column if it exists
        const dropColumnIfExists = async (table: string, column: string) => {
            const columnExists = await queryRunner.query(`
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = '${table}' AND column_name = '${column}'
            `);
            if (columnExists && columnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "${column}"`);
                console.log(`Dropped column ${column} from ${table}`);
            } else {
                console.log(`Column ${column} does not exist on ${table}, skipping`);
            }
        };

        // Drop portfolio_id columns if they exist
        await dropColumnIfExists('lease_charge', 'portfolio_id');
        await dropColumnIfExists('payment', 'portfolio_id');
        await dropColumnIfExists('maintenance_request', 'portfolio_id');
        await dropColumnIfExists('work_order', 'portfolio_id');
        await dropColumnIfExists('document', 'portfolio_id');

        // Helper function to safely drop an index if it exists
        const dropIndexIfExists = async (indexName: string) => {
            const indexExists = await queryRunner.query(`
                SELECT 1 FROM pg_indexes 
                WHERE indexname = '${indexName}'
            `);
            if (indexExists && indexExists.length > 0) {
                await queryRunner.query(`DROP INDEX "${indexName}"`);
                console.log(`Dropped index ${indexName}`);
            } else {
                console.log(`Index ${indexName} does not exist, skipping`);
            }
        };

        // Drop indexes if they exist
        await dropIndexIfExists('IDX_lease_charge_portfolio_id');
        await dropIndexIfExists('IDX_payment_portfolio_id');
        await dropIndexIfExists('IDX_maintenance_request_portfolio_id');
        await dropIndexIfExists('IDX_work_order_portfolio_id');
        await dropIndexIfExists('IDX_document_portfolio_id');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add portfolio_id columns back
        await queryRunner.query(`ALTER TABLE "lease_charge" ADD "portfolio_id" integer`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "portfolio_id" integer`);
        await queryRunner.query(`ALTER TABLE "maintenance_request" ADD "portfolio_id" integer`);
        await queryRunner.query(`ALTER TABLE "work_order" ADD "portfolio_id" integer`);
        await queryRunner.query(`ALTER TABLE "document" ADD "portfolio_id" integer`);

        // Recreate indexes
        await queryRunner.query(`CREATE INDEX "IDX_lease_charge_portfolio_id" ON "lease_charge" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_payment_portfolio_id" ON "payment" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_maintenance_request_portfolio_id" ON "maintenance_request" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_work_order_portfolio_id" ON "work_order" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_document_portfolio_id" ON "document" ("portfolio_id") `);

        // Recreate foreign key constraints
        await queryRunner.query(`ALTER TABLE "lease_charge" ADD CONSTRAINT "FK_lease_charge_portfolio_id" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_portfolio_id" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "maintenance_request" ADD CONSTRAINT "FK_maintenance_request_portfolio_id" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_order" ADD CONSTRAINT "FK_work_order_portfolio_id" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_document_portfolio_id" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
