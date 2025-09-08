import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { join } from 'path';
import * as pg from 'pg';
import 'dotenv/config';

// Import pg-native if available
try {
  const pgNative = require('pg-native');
  // @ts-ignore - Assigning to read-only property
  pg.native = pgNative;
} catch (error) {
  console.warn('pg-native not installed, falling back to JavaScript implementation');
}

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

// Helper to parse database URL from environment
const parseDatabaseUrl = () => {
  // Handle Neon connection string format
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    // Handle Neon's connection string format
    if (url.hostname.includes('neon.tech')) {
      return {
        host: url.hostname,
        port: parseInt(url.port, 10) || 5432,
        username: url.username,
        password: url.password,
        database: url.pathname.replace(/^\//, '').split('?')[0], // Remove query params
        ssl: true
      };
    }
    // Standard PostgreSQL connection string
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 5432,
      username: url.username,
      password: url.password,
      database: url.pathname.replace(/^\//, '').split('?')[0],
      ssl: url.searchParams.get('sslmode') === 'require'
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'property_management',
    ssl: process.env.DB_SSL === 'true'
  };
};

const dbConfig = parseDatabaseUrl();

const baseConfig: TypeOrmModuleOptions & PostgresConnectionOptions = {
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl ? {
    rejectUnauthorized: false, // Required for Neon
  } : false,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: process.env.DB_SYNC === 'true',
  logging: logging ? 'all' : ['error'],
  migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
  // @ts-ignore - autoLoadEntities is a valid option for TypeOrmModule.forRoot()
  autoLoadEntities: true,
  // Connection options
  extra: {
    // Set the pg module
    ...(pg.native ? { pgNative: pg.native } : {}),
    // Pool configuration
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    // SSL configuration (enabled by default in production)
    ...(isProduction || process.env.DB_SSL === 'true' ? {
      ssl: {
        rejectUnauthorized: false
      }
    } : {})
  },
  // Use native driver if available
  ...(pg.native ? { driver: pg.native } : {}),
  // Retry configuration
  retryAttempts: 10,
  retryDelay: 3000,
  // Set statement timeout (in milliseconds)
  // @ts-ignore - statement_timeout is a valid PostgreSQL option in extra
  statement_timeout: 10000
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
