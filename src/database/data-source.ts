import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Report } from '../reports/report.entity';
import { Account } from '../accounts/account.entity';
import { Property } from '../properties/property.entity';
import { Notification } from '../notifications/notification.entity';

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
  entities: [User, Report, Account, Property, Notification],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
  ssl: configService.get<boolean>('DB_SSL', false) ? { rejectUnauthorized: false } : false,
}); 