import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBillingMoneyflow1692970000000 implements MigrationInterface {
    name = 'CreateBillingMoneyflow1692970000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_20cc84d8a2274ae86f551360c11"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2c5c19ef08665dd1d123aebe50"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_20cc84d8a2274ae86f551360c1"`);
        await queryRunner.query(`CREATE TABLE "payment_application" ("payment_id" integer NOT NULL, "invoice_id" integer NOT NULL, "amount" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_010f88679293834f1660510d206" PRIMARY KEY ("payment_id", "invoice_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2b4fa2d71c82de59053aa0aca7" ON "payment_application" ("payment_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9c8c30c178ebe905e59077f84a" ON "payment_application" ("invoice_id") `);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "invoice_id"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "received_at"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "lease_id" integer`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "at" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "method" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "method" SET DEFAULT 'cash'`);
        await queryRunner.query(`CREATE INDEX "IDX_2d5167c4ef1c8ab3342ac3d05e" ON "payment" ("lease_id") `);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6" FOREIGN KEY ("lease_id") REFERENCES "lease"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_application" ADD CONSTRAINT "FK_2b4fa2d71c82de59053aa0aca72" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_application" ADD CONSTRAINT "FK_9c8c30c178ebe905e59077f84ab" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_application" DROP CONSTRAINT "FK_9c8c30c178ebe905e59077f84ab"`);
        await queryRunner.query(`ALTER TABLE "payment_application" DROP CONSTRAINT "FK_2b4fa2d71c82de59053aa0aca72"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_2d5167c4ef1c8ab3342ac3d05e6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d5167c4ef1c8ab3342ac3d05e"`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "method" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "method" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "status" SET DEFAULT 'open'`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "at"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "lease_id"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "status" character varying NOT NULL DEFAULT 'succeeded'`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "received_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "invoice_id" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9c8c30c178ebe905e59077f84a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b4fa2d71c82de59053aa0aca7"`);
        await queryRunner.query(`DROP TABLE "payment_application"`);
        await queryRunner.query(`CREATE INDEX "IDX_20cc84d8a2274ae86f551360c1" ON "payment" ("invoice_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2c5c19ef08665dd1d123aebe50" ON "payment" ("received_at") `);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_20cc84d8a2274ae86f551360c11" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
