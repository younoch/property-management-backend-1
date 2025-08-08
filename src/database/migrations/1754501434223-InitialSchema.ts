import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1754501434223 implements MigrationInterface {
    name = 'InitialSchema1754501434223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "report" ("id" SERIAL NOT NULL, "approved" boolean NOT NULL DEFAULT false, "price" integer NOT NULL, "make" character varying NOT NULL, "model" character varying NOT NULL, "year" integer NOT NULL, "lng" integer NOT NULL, "lat" integer NOT NULL, "mileage" integer NOT NULL, "userId" integer, CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_687244a6195b0ed2d721278fe2" ON "report" ("approved") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc88bed8529ef3611f8aecaf73" ON "report" ("year") `);
        await queryRunner.query(`CREATE INDEX "IDX_2137361f233f88b89344f8231d" ON "report" ("lat", "lng") `);
        await queryRunner.query(`CREATE INDEX "IDX_30c18179b1981c82cddbbdd40a" ON "report" ("make", "model") `);
        await queryRunner.query(`CREATE TABLE "property" ("id" SERIAL NOT NULL, "account_id" integer NOT NULL, "name" character varying NOT NULL, "address_line1" character varying NOT NULL, "address_line2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "zip_code" character varying NOT NULL, "country" character varying NOT NULL, "latitude" numeric(10,6) NOT NULL, "longitude" numeric(10,6) NOT NULL, "property_type" character varying NOT NULL, "number_of_units" integer NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_85d8ae8f941ec5241e515bf69c" ON "property" ("property_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_45cbf848b958b21e6c1547df95" ON "property" ("city", "state") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f21a21c4a57d2348412292376" ON "property" ("account_id") `);
        await queryRunner.query(`CREATE TABLE "account" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "landlord_id" integer NOT NULL, "subscription_plan" character varying NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_90f9eafb4703666963ae861c26" ON "account" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_5016edc6fa3d23a4fcdf86513f" ON "account" ("landlord_id") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" character varying NOT NULL, "profile_image_url" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "password" character varying, "admin" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_e347c56b008c2057c9887e230aa" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "property" ADD CONSTRAINT "FK_7f21a21c4a57d2348412292376d" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_5016edc6fa3d23a4fcdf86513f4" FOREIGN KEY ("landlord_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_5016edc6fa3d23a4fcdf86513f4"`);
        await queryRunner.query(`ALTER TABLE "property" DROP CONSTRAINT "FK_7f21a21c4a57d2348412292376d"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_e347c56b008c2057c9887e230aa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5016edc6fa3d23a4fcdf86513f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_90f9eafb4703666963ae861c26"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f21a21c4a57d2348412292376"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_45cbf848b958b21e6c1547df95"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85d8ae8f941ec5241e515bf69c"`);
        await queryRunner.query(`DROP TABLE "property"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_30c18179b1981c82cddbbdd40a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2137361f233f88b89344f8231d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc88bed8529ef3611f8aecaf73"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_687244a6195b0ed2d721278fe2"`);
        await queryRunner.query(`DROP TABLE "report"`);
    }

}
