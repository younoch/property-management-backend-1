import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { User } from '../users/user.entity';
import { Account } from '../accounts/account.entity';
import { Property } from '../properties/property.entity';
import { Notification } from '../notifications/notification.entity';
import { AccountMember } from '../accounts/account-member.entity';
import { Unit } from '../properties/unit.entity';
import { Tenant } from '../tenancy/tenant.entity';
import { Lease } from '../tenancy/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { LeaseCharge } from '../billing/lease-charge.entity';
import { Invoice } from '../billing/invoice.entity';
import { InvoiceItem } from '../billing/invoice-item.entity';
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
  logging: true,
  entities: [
    User,
    Account,
    AccountMember,
    Property,
    Unit,
    Tenant,
    Lease,
    LeaseTenant,
    LeaseCharge,
    Invoice,
    InvoiceItem,
    Payment,
    MaintenanceRequest,
    WorkOrder,
    Document,
    Notification,
  ],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
  ssl: (configService.get<string>('DB_SSL') === 'true') ? { rejectUnauthorized: false } : false,
}); 