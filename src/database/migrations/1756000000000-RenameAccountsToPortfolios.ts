import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameAccountsToPortfolios1756000000000 implements MigrationInterface {
  name = 'RenameAccountsToPortfolios1756000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Rename base tables
    await queryRunner.query(`ALTER TABLE "account" RENAME TO "portfolio"`);
    await queryRunner.query(`ALTER TABLE "account_member" RENAME TO "portfolio_member"`);

    // 2) Drop FKs that reference account and rename account_id -> portfolio_id, then re-add FKs to portfolio
    // property
    await queryRunner.query(`ALTER TABLE "property" DROP CONSTRAINT IF EXISTS "FK_7f21a21c4a57d2348412292376d"`);
    await queryRunner.query(`ALTER TABLE "property" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "property" ADD CONSTRAINT "FK_property_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // unit
    await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT IF EXISTS "FK_a270db28cb2784992dcf7c4a9ab"`);
    await queryRunner.query(`ALTER TABLE "unit" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT IF EXISTS "UQ_62f6aa79f9e2a9f0de33da6568a"`);
    await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "UQ_unit_portfolio_property_label" UNIQUE ("portfolio_id","property_id","label")`);
    await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "FK_unit_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // tenant
    await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT IF EXISTS "FK_d2a3ef4033097b91c9097e8413a"`);
    await queryRunner.query(`ALTER TABLE "tenant" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_tenant_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // lease
    await queryRunner.query(`ALTER TABLE "lease" DROP CONSTRAINT IF EXISTS "FK_80bf2a18b0559a7e37552a935f1"`);
    await queryRunner.query(`ALTER TABLE "lease" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "lease" ADD CONSTRAINT "FK_lease_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // lease_charge
    await queryRunner.query(`ALTER TABLE "lease_charge" DROP CONSTRAINT IF EXISTS "FK_924912cfdf1b1c94268f338eab4"`);
    await queryRunner.query(`ALTER TABLE "lease_charge" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "lease_charge" ADD CONSTRAINT "FK_lease_charge_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // invoice
    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT IF EXISTS "FK_7743b783da4d0b74b7bfdfd4818"`);
    await queryRunner.query(`ALTER TABLE "invoice" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // payment
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "FK_bb95477ae48c741a9c1445babfd"`);
    await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // maintenance_request
    await queryRunner.query(`ALTER TABLE "maintenance_request" DROP CONSTRAINT IF EXISTS "FK_639068731753024a99582b75e86"`);
    await queryRunner.query(`ALTER TABLE "maintenance_request" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "maintenance_request" ADD CONSTRAINT "FK_maintenance_request_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // work_order
    await queryRunner.query(`ALTER TABLE "work_order" DROP CONSTRAINT IF EXISTS "FK_b914b1dc56df2b1a245269f2a0c"`);
    await queryRunner.query(`ALTER TABLE "work_order" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "work_order" ADD CONSTRAINT "FK_work_order_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // document
    await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT IF EXISTS "FK_a05e62b6b25192e8ff52fd197ed"`);
    await queryRunner.query(`ALTER TABLE "document" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_document_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // notification
    await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT IF EXISTS "FK_account_notification"`);
    // Above FK name might differ; ensure we drop any FK referencing account
    await queryRunner.query(`DO $$ DECLARE r RECORD; BEGIN FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'notification'::regclass AND confrelid = 'account'::regclass) LOOP EXECUTE 'ALTER TABLE "notification" DROP CONSTRAINT ' || quote_ident(r.conname); END LOOP; END $$;`);
    await queryRunner.query(`ALTER TABLE "notification" RENAME COLUMN "account_id" TO "portfolio_id"`);
    await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_portfolio" FOREIGN KEY ("portfolio_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);

    // 3) Update portfolio_member FKs to portfolio
    await queryRunner.query(`ALTER TABLE "portfolio_member" DROP CONSTRAINT IF EXISTS "FK_798edece4554ae98edf3693dd84"`);
    await queryRunner.query(`ALTER TABLE "portfolio_member" ADD CONSTRAINT "FK_portfolio_member_portfolio" FOREIGN KEY ("account_id") REFERENCES "portfolio"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse operations
    // Drop new FKs and revert column renames
    await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT IF EXISTS "FK_notification_portfolio"`);
    await queryRunner.query(`ALTER TABLE "notification" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT IF EXISTS "FK_document_portfolio"`);
    await queryRunner.query(`ALTER TABLE "document" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "work_order" DROP CONSTRAINT IF EXISTS "FK_work_order_portfolio"`);
    await queryRunner.query(`ALTER TABLE "work_order" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "maintenance_request" DROP CONSTRAINT IF EXISTS "FK_maintenance_request_portfolio"`);
    await queryRunner.query(`ALTER TABLE "maintenance_request" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "FK_payment_portfolio"`);
    await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT IF EXISTS "FK_invoice_portfolio"`);
    await queryRunner.query(`ALTER TABLE "invoice" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "lease_charge" DROP CONSTRAINT IF EXISTS "FK_lease_charge_portfolio"`);
    await queryRunner.query(`ALTER TABLE "lease_charge" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "lease" DROP CONSTRAINT IF EXISTS "FK_lease_portfolio"`);
    await queryRunner.query(`ALTER TABLE "lease" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT IF EXISTS "FK_tenant_portfolio"`);
    await queryRunner.query(`ALTER TABLE "tenant" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT IF EXISTS "FK_unit_portfolio"`);
    await queryRunner.query(`ALTER TABLE "unit" RENAME COLUMN "portfolio_id" TO "account_id"`);
    await queryRunner.query(`ALTER TABLE "unit" DROP CONSTRAINT IF EXISTS "UQ_unit_portfolio_property_label"`);
    await queryRunner.query(`ALTER TABLE "unit" ADD CONSTRAINT "UQ_62f6aa79f9e2a9f0de33da6568a" UNIQUE ("account_id","property_id","label")`);
    await queryRunner.query(`ALTER TABLE "property" DROP CONSTRAINT IF EXISTS "FK_property_portfolio"`);
    await queryRunner.query(`ALTER TABLE "property" RENAME COLUMN "portfolio_id" TO "account_id"`);

    // portfolio_member back to account_member
    await queryRunner.query(`ALTER TABLE "portfolio_member" DROP CONSTRAINT IF EXISTS "FK_portfolio_member_portfolio"`);
    await queryRunner.query(`ALTER TABLE "portfolio_member" RENAME TO "account_member"`);

    // portfolio back to account
    await queryRunner.query(`ALTER TABLE "portfolio" RENAME TO "account"`);
  }
}


