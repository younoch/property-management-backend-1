// src/database/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../users/user.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Property } from '../properties/property.entity';
import { Notification } from '../notifications/notification.entity';
import { PortfolioMember } from '../portfolios/portfolio-member.entity';
import { Unit } from '../units/unit.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Lease } from '../leases/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { LeaseCharge } from '../billing/lease-charges/entities/lease-charge.entity';
import { Invoice } from '../billing/invoices/entities/invoice.entity';
import { PaymentApplication } from '../billing/payments/entities/payment-application.entity';
import { Payment } from '../billing/payments/entities/payment.entity';
import { MaintenanceRequest } from '../maintenance/maintenance-request.entity';
import { WorkOrder } from '../maintenance/work-order.entity';
import { Document } from '../documents/document.entity';
import { Expense } from '../expenses/expense.entity';

// Load environment variables for CLI context
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

console.log('🔎 DB_HOST:', process.env.DB_HOST);
console.log('🔎 DB_SSL:', process.env.DB_SSL);

// Helper to determine SSL configuration
const sslConfig = process.env.DB_SSL === 'true' 
  ? { rejectUnauthorized: false } 
  : undefined;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'rR%jrYKNqQdnYVQUkzuN',
  database: process.env.DB_NAME || 'property_management',
  // Disable synchronize in all environments - use migrations instead
  synchronize: false, // Always false since we're using migrations
  // Ensure migrations auto-run in production boot flow
  migrationsRun: process.env.NODE_ENV === 'production',
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Disable all logging
  logging: [],
  logger: 'advanced-console',
  entities: [
    User,
    Portfolio,
    PortfolioMember,
    Property,
    Unit,
    Tenant,
    Lease,
    LeaseTenant,
    LeaseCharge,
    Invoice,
    Payment,
    PaymentApplication,
    MaintenanceRequest,
    WorkOrder,
    Document,
    Notification,
    Expense,
  ],
  subscribers: [],
  ssl: sslConfig, // ✅ Neon SSL fix
});
