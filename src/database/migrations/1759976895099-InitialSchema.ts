import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759976895099 implements MigrationInterface {
    name = 'InitialSchema1759976895099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property" RENAME COLUMN "postal_code" TO "zip_code"`);
        await queryRunner.query(`ALTER TABLE "units" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."units_status_enum" AS ENUM('vacant', 'occupied', 'maintenance')`);
        await queryRunner.query(`ALTER TABLE "units" ADD "status" "public"."units_status_enum" NOT NULL DEFAULT 'vacant'`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "units" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."units_status_enum"`);
        await queryRunner.query(`ALTER TABLE "units" ADD "status" character varying NOT NULL DEFAULT 'vacant'`);
        await queryRunner.query(`ALTER TABLE "property" RENAME COLUMN "zip_code" TO "postal_code"`);
    }

}
