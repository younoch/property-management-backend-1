import { MigrationInterface, QueryRunner } from "typeorm";
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export class RemovePortfolioRelations1759058700000 implements MigrationInterface {
    name = 'RemovePortfolioRelations1759058700000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Starting migration: Removing portfolio relations...');
        
        // Drop foreign key constraints if they exist
        await this.dropForeignKeyIfExists(queryRunner, 'lease_charge', 'FK_lease_charge_portfolio_id');
        await this.dropForeignKeyIfExists(queryRunner, 'payment', 'FK_payment_portfolio_id');
        await this.dropForeignKeyIfExists(queryRunner, 'maintenance_request', 'FK_maintenance_request_portfolio_id');
        await this.dropForeignKeyIfExists(queryRunner, 'work_order', 'FK_work_order_portfolio_id');
        await this.dropForeignKeyIfExists(queryRunner, 'document', 'FK_document_portfolio_id');

        // Drop portfolio_id columns if they exist
        await this.dropColumnIfExists(queryRunner, 'lease_charge', 'portfolio_id');
        await this.dropColumnIfExists(queryRunner, 'payment', 'portfolio_id');
        await this.dropColumnIfExists(queryRunner, 'maintenance_request', 'portfolio_id');
        await this.dropColumnIfExists(queryRunner, 'work_order', 'portfolio_id');
        await this.dropColumnIfExists(queryRunner, 'document', 'portfolio_id');

        // Drop indexes if they exist
        await this.dropIndexIfExists(queryRunner, 'IDX_lease_charge_portfolio_id');
        await this.dropIndexIfExists(queryRunner, 'IDX_payment_portfolio_id');
        await this.dropIndexIfExists(queryRunner, 'IDX_maintenance_request_portfolio_id');
        await this.dropIndexIfExists(queryRunner, 'IDX_work_order_portfolio_id');
        await this.dropIndexIfExists(queryRunner, 'IDX_document_portfolio_id');

        console.log('Migration completed: Portfolio relations removed successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This is a destructive migration, so the down method is intentionally left empty
        // as we don't want to automatically recreate these columns and constraints
        console.log('Note: The down migration is intentionally left empty as this is a destructive operation');
    }

    private async dropForeignKeyIfExists(queryRunner: QueryRunner, tableName: string, constraintName: string): Promise<void> {
        const hasConstraint = await this.constraintExists(queryRunner, tableName, constraintName);
        if (hasConstraint) {
            console.log(`Dropping foreign key ${constraintName} from ${tableName}`);
            await queryRunner.query(`ALTER TABLE "${tableName}" DROP CONSTRAINT "${constraintName}"`);
        }
    }

    private async dropColumnIfExists(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<void> {
        const hasColumn = await this.columnExists(queryRunner, tableName, columnName);
        if (hasColumn) {
            console.log(`Dropping column ${columnName} from ${tableName}`);
            await queryRunner.query(`ALTER TABLE "${tableName}" DROP COLUMN "${columnName}"`);
        }
    }

    private async dropIndexIfExists(queryRunner: QueryRunner, indexName: string): Promise<void> {
        const hasIndex = await this.indexExists(queryRunner, indexName);
        if (hasIndex) {
            console.log(`Dropping index ${indexName}`);
            await queryRunner.query(`DROP INDEX IF EXISTS "${indexName}"`);
        }
    }

    private async constraintExists(queryRunner: QueryRunner, tableName: string, constraintName: string): Promise<boolean> {
        const result = await queryRunner.query(
            `SELECT 1 FROM information_schema.table_constraints ` +
            `WHERE table_name = $1 AND constraint_name = $2`,
            [tableName, constraintName]
        );
        return result.length > 0;
    }

    private async columnExists(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<boolean> {
        const result = await queryRunner.query(
            `SELECT 1 FROM information_schema.columns ` +
            `WHERE table_name = $1 AND column_name = $2`,
            [tableName, columnName]
        );
        return result.length > 0;
    }

    private async indexExists(queryRunner: QueryRunner, indexName: string): Promise<boolean> {
        const result = await queryRunner.query(
            `SELECT 1 FROM pg_indexes WHERE indexname = $1`,
            [indexName]
        );
        return result.length > 0;
    }
}
