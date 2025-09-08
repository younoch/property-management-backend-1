import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const sslConfig = process.env.DB_SSL === 'true' ? {
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
} : {};

// Enable query logging in development and test environments
const logging = !isProduction && !isTest;

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'property_management',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: process.env.DB_SYNC === 'true',
  logging: logging ? 'all' : ['error'],
  ...(isProduction ? sslConfig : {}),
  migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
  autoLoadEntities: true,
};

export default databaseConfig;
