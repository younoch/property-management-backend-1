import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnappliedAmountToPayments1719270000000 implements MigrationInterface {
    name = 'AddUnappliedAmountToPayments1719270000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ADD "unapplied_amount" numeric(12,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "unapplied_amount"`);
    }
}
