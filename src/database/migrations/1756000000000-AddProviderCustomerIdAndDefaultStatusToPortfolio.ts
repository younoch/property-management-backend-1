import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderCustomerIdAndDefaultStatusToPortfolio1756000000000 implements MigrationInterface {
    name = 'AddProviderCustomerIdAndDefaultStatusToPortfolio1756000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portfolio" ADD COLUMN IF NOT EXISTS "provider_customer_id" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "portfolio" ALTER COLUMN "status" SET DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portfolio" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "portfolio" DROP COLUMN "provider_customer_id"`);
    }
}


