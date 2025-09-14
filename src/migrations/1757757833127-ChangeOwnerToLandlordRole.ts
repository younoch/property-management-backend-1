import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeOwnerToLandlordRole1757757833127 implements MigrationInterface {
    name = 'ChangeOwnerToLandlordRole1757757833127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
    }

}
