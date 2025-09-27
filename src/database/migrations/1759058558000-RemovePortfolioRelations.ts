import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePortfolioRelations1759058558000 implements MigrationInterface {
    name = 'RemovePortfolioRelations1759058558000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "lease_charge" DROP CONSTRAINT "FK_lease_charge_portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "maintenance_request" DROP CONSTRAINT "FK_maintenance_request_portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "work_order" DROP CONSTRAINT "FK_work_order_portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_document_portfolio_id"`);

        // Drop portfolio_id columns
        await queryRunner.query(`ALTER TABLE "lease_charge" DROP COLUMN "portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "maintenance_request" DROP COLUMN "portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "work_order" DROP COLUMN "portfolio_id"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "portfolio_id"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_lease_charge_portfolio_id"`);
        await queryRunner.query(`DROP INDEX "IDX_payment_portfolio_id"`);
        await queryRunner.query(`DROP INDEX "IDX_maintenance_request_portfolio_id"`);
        await queryRunner.query(`DROP INDEX "IDX_work_order_portfolio_id"`);
        await queryRunner.query(`DROP INDEX "IDX_document_portfolio_id"`);
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
