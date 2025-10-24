import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleAuthFields1761320838836 implements MigrationInterface {
    name = 'AddGoogleAuthFields1761320838836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "google_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_email_verified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
    }

}
