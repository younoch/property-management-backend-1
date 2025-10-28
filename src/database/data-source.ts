// src/database/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
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
import { AuditLog } from '../common/audit-log.entity';
import { Feedback } from '../feedback/feedback.entity';

// Load environment variables from .env.development or .env.production
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

// Helper to determine SSL configuration
const sslConfig = process.env.DB_SSL === 'true' 
  ? { rejectUnauthorized: false } 
  : undefined;

// Create a new DataSource instance
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Disable synchronize in all environments - use migrations instead
  synchronize: false,
  migrationsRun: process.env.NODE_ENV === 'production',
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  
  // Logging configuration
  logging: ['error'],
  logger: 'advanced-console',
  
  // Entities
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
    AuditLog,
    Feedback,
  ],
  
  subscribers: [],
  ssl: sslConfig,
  
  // Extra connection options
  extra: {
    // Connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  },
});
