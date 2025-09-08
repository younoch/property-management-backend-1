import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const sslConfig = {
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
  } : false,
};

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'property_management',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: process.env.DB_SYNC === 'true',
  logging: !isProduction && !isTest ? ['query', 'error'] : ['error'],
  ...(isProduction ? sslConfig : {}),
  migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
