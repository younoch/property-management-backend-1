import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { User } from '../users/user.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Property } from '../properties/property.entity';
import { Notification } from '../notifications/notification.entity';
import { PortfolioMember } from '../portfolios/portfolio-member.entity';
import { Unit } from '../properties/unit.entity';
import { Tenant } from '../tenancy/tenant.entity';
import { Lease } from '../tenancy/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { LeaseCharge } from '../billing/lease-charge.entity';
import { Invoice } from '../billing/invoice.entity';
import { PaymentApplication } from '../billing/payment-application.entity';
import { Payment } from '../billing/payment.entity';
import { MaintenanceRequest } from '../maintenance/maintenance-request.entity';
import { WorkOrder } from '../maintenance/work-order.entity';
import { Document } from '../documents/document.entity';

// Load environment variables for CLI context
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  synchronize: false, // Disable synchronize for migrations
  migrationsRun: false, // We'll run migrations manually
  migrationsTableName: 'migrations',
  migrations: ['src/database/migrations/*.ts'],
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
  ],
  subscribers: [],
  ssl: ((process.env.NODE_ENV === 'production') && (configService.get<string>('DB_SSL') === 'true'))
    ? { rejectUnauthorized: false }
    : false,
}); 