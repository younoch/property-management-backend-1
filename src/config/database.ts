import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { join } from 'path';
import 'dotenv/config';

// Explicitly use the JavaScript implementation of pg
const pg = require('pg');

// Disable pg-native to prevent Pool constructor issues
process.env.PG_USE_NATIVE = 'false';

// Ensure we're using the correct Pool implementation
if (!pg.Pool) {
  throw new Error('pg.Pool is not available. Check your node-postgres installation.');
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

// Debug: Log database configuration
console.log('Database Configuration:');
console.log('- Host:', dbConfig.host);
console.log('- Port:', dbConfig.port);
console.log('- Database:', dbConfig.database);
console.log('- SSL Enabled:', !!dbConfig.ssl);
console.log('Environment:', process.env.NODE_ENV || 'development');

const baseConfig: TypeOrmModuleOptions & PostgresConnectionOptions = {
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  
  // SSL configuration
  ssl: dbConfig.ssl ? {
    rejectUnauthorized: false, // Required for Neon
  } : false,
  
  // Connection pool settings
  extra: {
    ...(dbConfig.ssl && { 
      ssl: { 
        rejectUnauthorized: false 
      } 
    }),
    // Pool settings
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    // Statement timeout in milliseconds
    statement_timeout: 10000
  },
  
  // Entity and migration configuration
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: process.env.DB_SYNC === 'true',
  logging: logging ? 'all' : ['error'],
  migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
  // @ts-ignore - autoLoadEntities is a valid option for TypeOrmModule.forRoot()
  autoLoadEntities: true,
  
  // Retry configuration
  retryAttempts: 10,
  retryDelay: 3000,
};

// Production-specific configurations
const productionConfig: Partial<PostgresConnectionOptions> = {
  // Use SSL in production
  ssl: {
    rejectUnauthorized: false
  },
  // Production connection pool settings
  extra: {
    ...sslConfig.extra,
    // Pool settings
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    // Statement timeout in milliseconds
    statement_timeout: 10000
  }
};

// Merge configurations based on environment
const finalConfig = {
  ...baseConfig,
  ...(isProduction ? productionConfig : {
    // Development pool settings (more relaxed)
    extra: {
      ...baseConfig.extra,
      max: 10,
      min: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 2000,
    }
  }),
};

// Debug: Log final configuration
console.log('Final Database Configuration:');
console.log('- Type:', finalConfig.type);
console.log('- Host:', finalConfig.host);
console.log('- Port:', finalConfig.port);
console.log('- Database:', finalConfig.database);
console.log('- SSL:', finalConfig.ssl ? 'Enabled' : 'Disabled');
console.log('- Pool Settings:', {
  max: finalConfig.extra?.max,
  min: finalConfig.extra?.min,
  idleTimeout: finalConfig.extra?.idleTimeoutMillis,
  connectionTimeout: finalConfig.extra?.connectionTimeoutMillis
});

export const databaseConfig: TypeOrmModuleOptions = finalConfig;

export default databaseConfig;
