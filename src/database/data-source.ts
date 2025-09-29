// src/database/data-source.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
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
import { LeaseCharge } from '../billing/lease-charge.entity';
import { Invoice } from '../billing/entities/invoice.entity';
import { PaymentApplication } from '../billing/payment-application.entity';
import { Payment } from '../billing/payment.entity';
import { MaintenanceRequest } from '../maintenance/maintenance-request.entity';
import { WorkOrder } from '../maintenance/work-order.entity';
import { Document } from '../documents/document.entity';
import { Expense } from '../expenses/expense.entity';

// Load environment variables for CLI context
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const configService = new ConfigService();
console.log('🔎 DB_HOST:', configService.get<string>('DB_HOST'));
console.log('🔎 DB_SSL:', configService.get<string>('DB_SSL'));
// Helper to determine SSL configuration
const sslConfig =
  configService.get<string>('DB_SSL') === 'true'
    ? { rejectUnauthorized: false }
    : undefined;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: Number(configService.get<string>('DB_PORT')),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  // Use synchronize only in non-production to avoid destructive/implicit schema changes
  synchronize: process.env.NODE_ENV !== 'production',
  // Ensure migrations auto-run in production boot flow
  migrationsRun: process.env.NODE_ENV === 'production',
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  logging: true,
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
