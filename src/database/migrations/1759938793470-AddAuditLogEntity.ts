import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLogEntity1759938793470 implements MigrationInterface {
    name = 'AddAuditLogEntity1759938793470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'PAYMENT', 'INVOICE_ISSUE', 'INVOICE_VOID', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PERMISSION_CHANGE', 'STATUS_CHANGE', 'EXPORT', 'IMPORT', 'BACKUP', 'RESTORE')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity_type" character varying(50) NOT NULL, "entity_id" character varying(50) NOT NULL, "action" "public"."audit_logs_action_enum" NOT NULL DEFAULT 'UPDATE', "user_id" character varying(50), "portfolio_id" character varying(50), "metadata" jsonb NOT NULL DEFAULT '{}', "description" text, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ip_address" character varying(50), "user_agent" character varying(255), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ea9ba3dfb39050f831ee3be40d" ON "audit_logs" ("entity_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_85c204d8e47769ac183b32bf9c" ON "audit_logs" ("entity_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_bd2726fd31b35443f2245b93ba" ON "audit_logs" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1b008dfde4c50ce134c0877ff4" ON "audit_logs" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_88dcc148d532384790ab874c3d" ON "audit_logs" ("timestamp") `);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_88dcc148d532384790ab874c3d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b008dfde4c50ce134c0877ff4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd2726fd31b35443f2245b93ba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85c204d8e47769ac183b32bf9c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea9ba3dfb39050f831ee3be40d"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    }

}
