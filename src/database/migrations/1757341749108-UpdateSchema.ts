import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1757341749108 implements MigrationInterface {
    name = 'UpdateSchema1757341749108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
    }

}
