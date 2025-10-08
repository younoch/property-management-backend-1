import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditLogFix1759938192986 implements MigrationInterface {
    name = 'AuditLogFix1759938192986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
    }

}
