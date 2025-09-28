import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentMethodsProduction1759087973411 implements MigrationInterface {
    name = 'UpdatePaymentMethodsProduction1759087973411';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create the new enum type
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_type t 
                    JOIN pg_enum e ON t.oid = e.enumtypid  
                    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                    WHERE t.typname = 'payment_method_enum' 
                ) THEN
                    CREATE TYPE "public"."payment_method_enum" AS ENUM(
                        'credit_card', 'debit_card', 'bank_transfer', 'ach_transfer', 
                        'wire_transfer', 'check', 'money_order', 'cash', 'paypal', 
                        'venmo', 'zelle', 'cash_app', 'cryptocurrency', 'other'
                    );
                END IF;
            END
            $$;
        `);

        // 2. Update payment table
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Rename method to payment_method if it exists
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'payment' AND column_name = 'method'
                ) THEN
                    ALTER TABLE "payment" RENAME COLUMN "method" TO "payment_method";
                END IF;

                -- Convert payment_method to text temporarily if it's not already
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'payment' 
                    AND column_name = 'payment_method' 
                    AND data_type = 'USER-DEFINED'
                ) THEN
                    ALTER TABLE "payment" 
                    ALTER COLUMN "payment_method" TYPE TEXT;
                END IF;

                -- Update values to match new format
                UPDATE "payment" 
                SET "payment_method" = CASE 
                    WHEN "payment_method" = 'card' THEN 'credit_card'
                    WHEN "payment_method" = 'ach' THEN 'bank_transfer'
                    WHEN "payment_method" = 'mobile' THEN 'cash_app'
                    ELSE "payment_method"
                END
                WHERE "payment_method" IS NOT NULL;

                -- Convert to enum type
                ALTER TABLE "payment" 
                ALTER COLUMN "payment_method" TYPE "payment_method_enum" 
                USING "payment_method"::text::"payment_method_enum";
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Error updating payment table: %', SQLERRM;
            END
            $$;
        `);

        // 3. Update expenses table
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Add payment_method column if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'expenses' AND column_name = 'payment_method'
                ) THEN
                    ALTER TABLE "expenses" 
                    ADD COLUMN "payment_method" "payment_method_enum";
                ELSE
                    -- Convert existing column to enum type
                    ALTER TABLE "expenses" 
                    ALTER COLUMN "payment_method" TYPE TEXT;
                    
                    UPDATE "expenses" 
                    SET "payment_method" = 'other' 
                    WHERE "payment_method" IS NOT NULL 
                    AND "payment_method" NOT IN (
                        'credit_card', 'debit_card', 'bank_transfer', 'ach_transfer', 
                        'wire_transfer', 'check', 'money_order', 'cash', 'paypal', 
                        'venmo', 'zelle', 'cash_app', 'cryptocurrency', 'other'
                    );
                    
                    ALTER TABLE "expenses" 
                    ALTER COLUMN "payment_method" TYPE "payment_method_enum" 
                    USING "payment_method"::text::"payment_method_enum";
                END IF;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Error updating expenses table: %', SQLERRM;
            END
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Revert expenses table
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'expenses' AND column_name = 'payment_method'
                ) THEN
                    ALTER TABLE "expenses" 
                    ALTER COLUMN "payment_method" TYPE TEXT;
                    
                    -- Revert any specific value mappings if needed
                    UPDATE "expenses" 
                    SET "payment_method" = 'other' 
                    WHERE "payment_method" IS NULL;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Error reverting expenses table: %', SQLERRM;
            END
            $$;
        `);

        // 2. Revert payment table
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'payment' AND column_name = 'payment_method'
                ) THEN
                    -- Convert to text first
                    ALTER TABLE "payment" 
                    ALTER COLUMN "payment_method" TYPE TEXT;
                    
                    -- Revert to old values
                    UPDATE "payment" 
                    SET "payment_method" = CASE 
                        WHEN "payment_method" = 'credit_card' THEN 'card'
                        WHEN "payment_method" = 'bank_transfer' THEN 'ach'
                        WHEN "payment_method" = 'cash_app' THEN 'mobile'
                        ELSE "payment_method"
                    END;
                    
                    -- Rename back to 'method' if it was originally named that
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'payment' AND column_name = 'payment_method'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'payment' AND column_name = 'method'
                    ) THEN
                        ALTER TABLE "payment" RENAME COLUMN "payment_method" TO "method";
                    END IF;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Error reverting payment table: %', SQLERRM;
            END
            $$;
        `);
        
        // Note: We don't drop the enum type as it might be in use by other columns
    }
}
