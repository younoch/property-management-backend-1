import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePropertyAddressFieldsOptional1756829817699 implements MigrationInterface {
    name = 'MakePropertyAddressFieldsOptional1756829817699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "portfolio_member" ("id" SERIAL NOT NULL, "portfolio_id" integer NOT NULL, "user_id" integer NOT NULL, "role" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_c3f978c50b74de4cd6587b36084" UNIQUE ("portfolio_id", "user_id"), CONSTRAINT "PK_0bc1504f157abeb106a54c517a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a2db3bb0a70771c7027c7309bf" ON "portfolio_member" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c02eecc90e0de3c1742116fefa" ON "portfolio_member" ("portfolio_id") `);
        await queryRunner.query(`DROP INDEX "public"."IDX_467ce77b0c2b05049d3a561987"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET DEFAULT to_char(CURRENT_DATE, 'YYYY-MM')`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_467ce77b0c2b05049d3a561987" ON "invoice" ("lease_id", "billing_month") WHERE status != 'void'`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" ADD CONSTRAINT "FK_c02eecc90e0de3c1742116fefa7" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" ADD CONSTRAINT "FK_a2db3bb0a70771c7027c7309bff" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portfolio_member" DROP CONSTRAINT "FK_a2db3bb0a70771c7027c7309bff"`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" DROP CONSTRAINT "FK_c02eecc90e0de3c1742116fefa7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_467ce77b0c2b05049d3a561987"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "billing_month" SET DEFAULT to_char((CURRENT_DATE), 'YYYY-MM')`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_467ce77b0c2b05049d3a561987" ON "invoice" ("lease_id", "billing_month") WHERE (status <> 'void'::invoice_status_enum)`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c02eecc90e0de3c1742116fefa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a2db3bb0a70771c7027c7309bf"`);
        await queryRunner.query(`DROP TABLE "portfolio_member"`);
    }

}
