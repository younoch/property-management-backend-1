import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentMethods1695933750000 implements MigrationInterface {
    name = 'UpdatePaymentMethods1695933750000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update expenses table
        await queryRunner.query(`
            ALTER TABLE "expenses" 
            ALTER COLUMN "payment_method" TYPE VARCHAR(20),
            ALTER COLUMN "payment_method" DROP NOT NULL;
        `);

        // Update payments table
        await queryRunner.query(`
            ALTER TABLE "payments" 
            ALTER COLUMN "payment_method" TYPE VARCHAR(20),
            ALTER COLUMN "payment_method" DROP NOT NULL;
        `);

        // Map old payment methods to new format for payments table
        await queryRunner.query(`
            UPDATE "payments" 
            SET "payment_method" = CASE 
                WHEN "payment_method" = 'card' THEN 'credit_card'
                WHEN "payment_method" = 'ach' THEN 'bank_transfer'
                WHEN "payment_method" = 'mobile' THEN 'cash_app'
                ELSE "payment_method"
            END
            WHERE "payment_method" IS NOT NULL;
        `);

        // Create enums in the database
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
                    CREATE TYPE "public"."payment_method_enum" AS ENUM (
                        'credit_card', 'debit_card', 'bank_transfer', 'ach_transfer', 
                        'wire_transfer', 'check', 'money_order', 'cash', 'paypal', 
                        'venmo', 'zelle', 'cash_app', 'cryptocurrency', 'other'
                    );
                END IF;
            END
            $$;
        `);

        // Update columns to use the new enum type
        await queryRunner.query(`
            ALTER TABLE "expenses" 
            ALTER COLUMN "payment_method" TYPE payment_method_enum 
            USING "payment_method"::payment_method_enum;

            ALTER TABLE "payments" 
            ALTER COLUMN "payment_method" TYPE payment_method_enum 
            USING "payment_method"::payment_method_enum;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert enum type to text first
        await queryRunner.query(`
            ALTER TABLE "expenses" 
            ALTER COLUMN "payment_method" TYPE VARCHAR(20);

            ALTER TABLE "payments" 
            ALTER COLUMN "payment_method" TYPE VARCHAR(20);
        `);

        // Revert payment method values in payments table
        await queryRunner.query(`
            UPDATE "payments" 
            SET "payment_method" = CASE 
                WHEN "payment_method" = 'credit_card' THEN 'card'
                WHEN "payment_method" = 'bank_transfer' THEN 'ach'
                WHEN "payment_method" = 'cash_app' THEN 'mobile'
                ELSE "payment_method"
            END
            WHERE "payment_method" IS NOT NULL;
        `);

        // Drop the enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."payment_method_enum";`);
    }
}
