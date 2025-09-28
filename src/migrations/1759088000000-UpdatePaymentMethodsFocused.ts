import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentMethodsFocused1759088000000 implements MigrationInterface {
    name = 'UpdatePaymentMethodsFocused1759088000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, update the payment method values in the payments table
        await queryRunner.query(`
            UPDATE "payment" 
            SET "method" = CASE 
                WHEN "method" = 'card' THEN 'credit_card'
                WHEN "method" = 'ach' THEN 'bank_transfer'
                WHEN "method" = 'mobile' THEN 'cash_app'
                ELSE "method"
            END
            WHERE "method" IS NOT NULL;
        `);

        // Rename the column in payments table to match our entity
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "method" TO "payment_method"`);

        // Update the enum type for payments
        await queryRunner.query(`
            ALTER TYPE "public"."payment_method_enum" RENAME TO "payment_method_enum_old";
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."payment_method_enum" AS ENUM(
                'credit_card', 'debit_card', 'bank_transfer', 'ach_transfer', 
                'wire_transfer', 'check', 'money_order', 'cash', 'paypal', 
                'venmo', 'zelle', 'cash_app', 'cryptocurrency', 'other'
            );
        `);

        await queryRunner.query(`
            ALTER TABLE "payment" 
            ALTER COLUMN "payment_method" TYPE "public"."payment_method_enum" 
            USING "payment_method"::text::"public"."payment_method_enum";
        `);

        await queryRunner.query(`
            DROP TYPE "public"."payment_method_enum_old";
        `);

        // Add payment_method column to expenses if it doesn't exist
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'expenses' AND column_name = 'payment_method') THEN
                    ALTER TABLE "expenses" 
                    ADD COLUMN "payment_method" "public"."payment_method_enum";
                END IF;
            END
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert payment method values in payments table
        await queryRunner.query(`
            UPDATE "payment" 
            SET "payment_method" = CASE 
                WHEN "payment_method" = 'credit_card' THEN 'card'
                WHEN "payment_method" = 'bank_transfer' THEN 'ach'
                WHEN "payment_method" = 'cash_app' THEN 'mobile'
                ELSE "payment_method"
            END
            WHERE "payment_method" IS NOT NULL;
        `);

        // Revert the enum type
        await queryRunner.query(`
            ALTER TYPE "public"."payment_method_enum" RENAME TO "payment_method_enum_new";
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."payment_method_enum" AS ENUM('cash', 'bank_transfer', 'card', 'ach', 'mobile');
        `);
        
        await queryRunner.query(`
            ALTER TABLE "payment" 
            ALTER COLUMN "payment_method" TYPE "public"."payment_method_enum" 
            USING "payment_method"::text::"public"."payment_method_enum";
        `);
        
        await queryRunner.query(`
            DROP TYPE "public"."payment_method_enum_new";
            
            -- Rename back the column
            ALTER TABLE "payment" RENAME COLUMN "payment_method" TO "method";
        `);
    }
}
