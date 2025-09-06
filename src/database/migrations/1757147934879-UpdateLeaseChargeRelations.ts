import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLeaseChargeRelations1757147934879 implements MigrationInterface {
    name = 'UpdateLeaseChargeRelations1757147934879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_467ce77b0c2b05049d3a561987"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET DEFAULT to_char(CURRENT_DATE, 'YYYY-MM')`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_467ce77b0c2b05049d3a561987" ON "invoice" ("lease_id", "billing_month") WHERE status != 'void'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_467ce77b0c2b05049d3a561987"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET DEFAULT to_char((CURRENT_DATE), 'YYYY-MM')`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_467ce77b0c2b05049d3a561987" ON "invoice" ("lease_id", "billing_month") WHERE (status <> 'void'::invoice_status_enum)`);
    }

}
