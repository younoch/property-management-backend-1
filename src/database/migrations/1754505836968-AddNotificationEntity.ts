import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationEntity1754505836968 implements MigrationInterface {
    name = 'AddNotificationEntity1754505836968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "type" character varying NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "channel" character varying NOT NULL, "sent_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7d60478bf7cacbbe3f7ae1bc1c" ON "notification" ("sent_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_aedc307c7e60ecb138e3f90ff8" ON "notification" ("is_read") `);
        await queryRunner.query(`CREATE INDEX "IDX_928b7aa1754e08e1ed7052cb9d" ON "notification" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_928b7aa1754e08e1ed7052cb9d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aedc307c7e60ecb138e3f90ff8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d60478bf7cacbbe3f7ae1bc1c"`);
        await queryRunner.query(`DROP TABLE "notification"`);
    }

}
