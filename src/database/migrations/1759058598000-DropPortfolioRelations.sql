-- Drop foreign key constraints
ALTER TABLE IF EXISTS lease_charge DROP CONSTRAINT IF EXISTS "FK_lease_charge_portfolio_id";
ALTER TABLE IF EXISTS payment DROP CONSTRAINT IF EXISTS "FK_payment_portfolio_id";
ALTER TABLE IF EXISTS maintenance_request DROP CONSTRAINT IF EXISTS "FK_maintenance_request_portfolio_id";
ALTER TABLE IF EXISTS work_order DROP CONSTRAINT IF EXISTS "FK_work_order_portfolio_id";
ALTER TABLE IF EXISTS document DROP CONSTRAINT IF EXISTS "FK_document_portfolio_id";

-- Drop portfolio_id columns
ALTER TABLE IF EXISTS lease_charge DROP COLUMN IF EXISTS portfolio_id;
ALTER TABLE IF EXISTS payment DROP COLUMN IF EXISTS portfolio_id;
ALTER TABLE IF EXISTS maintenance_request DROP COLUMN IF EXISTS portfolio_id;
ALTER TABLE IF EXISTS work_order DROP COLUMN IF EXISTS portfolio_id;
ALTER TABLE IF EXISTS document DROP COLUMN IF EXISTS portfolio_id;

-- Drop indexes
DROP INDEX IF EXISTS "IDX_lease_charge_portfolio_id";
DROP INDEX IF EXISTS "IDX_payment_portfolio_id";
DROP INDEX IF EXISTS "IDX_maintenance_request_portfolio_id";
DROP INDEX IF EXISTS "IDX_work_order_portfolio_id";
DROP INDEX IF EXISTS "IDX_document_portfolio_id";
