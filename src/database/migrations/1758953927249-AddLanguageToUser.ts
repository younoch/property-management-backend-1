import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLanguageToUser1758953927249 implements MigrationInterface {
    name = 'AddLanguageToUser1758953927249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "language" character varying(10) NOT NULL DEFAULT 'en'`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "language"`);
    }

}
