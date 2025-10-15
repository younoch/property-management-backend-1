import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserFeedback1760540108989 implements MigrationInterface {
    name = 'CreateUserFeedback1760540108989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "is_deleted" boolean NOT NULL DEFAULT false, "message" text NOT NULL, "user_id" uuid, "page_url" character varying(500), "metadata" jsonb, "is_reviewed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_94fb2b9415a96bde222d5e40598" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "user_feedback" ADD CONSTRAINT "FK_9eb49089eddfe8b11e18073cd79" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_feedback" DROP CONSTRAINT "FK_9eb49089eddfe8b11e18073cd79"`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "items" SET DEFAULT '[]'`);
        await queryRunner.query(`DROP TABLE "user_feedback"`);
    }

}
