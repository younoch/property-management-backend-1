import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
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
  // Connection pool settings
  pool: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  // Enable statement timeout
  statement_timeout: 10000,
  // Enable keepalive
  keepAlive: true,
} : {
  // Development pool settings (more relaxed)
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
  },
  keepAlive: true,
};

// Enable query logging in development and test environments
const logging = !isProduction && !isTest;

const baseConfig: TypeOrmModuleOptions & PostgresConnectionOptions = {
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
  migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
  // @ts-ignore - autoLoadEntities is a valid option for TypeOrmModule.forRoot()
  autoLoadEntities: true,
  // Enable retry logic
  retryAttempts: 10,
  retryDelay: 3000,
  // Set connection timeout
  extra: {
    connectionTimeoutMillis: 10000,
    idle_in_transaction_session_timeout: 10000,
    ...(isProduction ? sslConfig.extra : {})
  }
};

// Production-specific configurations
const productionConfig: Partial<PostgresConnectionOptions> = {
  ...sslConfig,
  extra: {
    ...sslConfig.extra,
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    // @ts-ignore - statement_timeout is a valid PostgreSQL option
    statement_timeout: 10000,
  }
};

export const databaseConfig: TypeOrmModuleOptions = {
  ...baseConfig,
  ...(isProduction ? productionConfig : {
    extra: {
      max: 10,
      min: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 2000,
    }
  }),
};

export default databaseConfig;
