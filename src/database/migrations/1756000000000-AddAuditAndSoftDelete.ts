import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditAndSoftDelete1756000000000 implements MigrationInterface {
    name = 'AddAuditAndSoftDelete1756000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add deleted_at to tables that already have created_at/updated_at
        await queryRunner.query(`ALTER TABLE "property" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "portfolio" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "unit" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "lease" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "lease_charge" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "payment" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "maintenance_request" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "work_order" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);

        // For join table lease_tenant: add audit + soft delete columns
        await queryRunner.query(`ALTER TABLE "lease_tenant" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lease_tenant" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lease_tenant" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert lease_tenant extra columns first
        await queryRunner.query(`ALTER TABLE "lease_tenant" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "lease_tenant" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "lease_tenant" DROP COLUMN "created_at"`);

        // Drop deleted_at from all tables
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "work_order" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "maintenance_request" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "lease_charge" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "lease" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "unit" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "portfolio" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "property" DROP COLUMN "deleted_at"`);
    }
}


