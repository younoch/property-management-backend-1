import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnappliedAmountToPayments1756293250208 implements MigrationInterface {
    name = 'AddUnappliedAmountToPayments1756293250208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_portfolio"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_lease"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_application_payment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_application_invoice"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invoice_portfolio"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invoice_lease"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_invoice_due_date"`);
        await queryRunner.query(`CREATE TABLE "portfolio_member" ("id" SERIAL NOT NULL, "portfolio_id" integer NOT NULL, "user_id" integer NOT NULL, "role" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_c3f978c50b74de4cd6587b36084" UNIQUE ("portfolio_id", "user_id"), CONSTRAINT "PK_0bc1504f157abeb106a54c517a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a2db3bb0a70771c7027c7309bf" ON "portfolio_member" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c02eecc90e0de3c1742116fefa" ON "portfolio_member" ("portfolio_id") `);
        await queryRunner.query(`ALTER TABLE "payment" ADD "unapplied_amount" numeric(12,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "method"`);
        await queryRunner.query(`CREATE TYPE "public"."payment_method_enum" AS ENUM('cash', 'bank_transfer', 'card', 'ach', 'mobile')`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "method" "public"."payment_method_enum" NOT NULL DEFAULT 'cash'`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "balance" SET DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" ADD CONSTRAINT "FK_c02eecc90e0de3c1742116fefa7" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" ADD CONSTRAINT "FK_a2db3bb0a70771c7027c7309bff" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portfolio_member" DROP CONSTRAINT "FK_a2db3bb0a70771c7027c7309bff"`);
        await queryRunner.query(`ALTER TABLE "portfolio_member" DROP CONSTRAINT "FK_c02eecc90e0de3c1742116fefa7"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "balance" SET DEFAULT 0.00`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "method"`);
        await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "method" character varying NOT NULL DEFAULT 'cash'`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "unapplied_amount"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c02eecc90e0de3c1742116fefa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a2db3bb0a70771c7027c7309bf"`);
        await queryRunner.query(`DROP TABLE "portfolio_member"`);
        await queryRunner.query(`CREATE INDEX "IDX_invoice_due_date" ON "invoice" ("due_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_invoice_lease" ON "invoice" ("lease_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_invoice_portfolio" ON "invoice" ("portfolio_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_payment_application_invoice" ON "payment_application" ("invoice_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_payment_application_payment" ON "payment_application" ("payment_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_payment_lease" ON "payment" ("lease_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_payment_portfolio" ON "payment" ("portfolio_id") `);
    }

}
