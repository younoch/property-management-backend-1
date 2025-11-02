import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveInvoiceNumberFromPayment1762110862223 implements MigrationInterface {
    name = 'RemoveInvoiceNumberFromPayment1762110862223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "invoice_number"`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "invoice_number" character varying(50) NOT NULL`);
    }

}
