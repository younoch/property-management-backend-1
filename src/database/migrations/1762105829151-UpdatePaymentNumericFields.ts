import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentNumericFields1762105829151 implements MigrationInterface {
    name = 'UpdatePaymentNumericFields1762105829151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
    }

}
