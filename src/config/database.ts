import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const fileExtension = isProduction ? 'js' : 'ts';

let databaseConfig: TypeOrmModuleOptions;

if (isTest && process.env.USE_SQLITE_FOR_TESTS === 'true') {
  // Optional: Use fast in-memory SQLite for tests to avoid external DB dependency
  databaseConfig = {
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    synchronize: false, // Always false - use migrations instead
    logging: false,
    entities: [join(__dirname, `../**/*.entity.${fileExtension}`)],
  } as TypeOrmModuleOptions;
} else if (isProduction) {
  databaseConfig = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    autoLoadEntities: true,
    synchronize: false, // Always false - use migrations instead
    migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
    logging: false,
    entities: [join(__dirname, `../**/*.entity.${fileExtension}`)],
    migrations: [join(__dirname, `../database/migrations/*.${fileExtension}`)],
  } as TypeOrmModuleOptions;
} else {
  console.log('Loading database config with port:', process.env.DB_PORT || '5432 (default)');
  
  // Use connection string if available, otherwise use individual parameters
  if (process.env.DATABASE_URL) {
    databaseConfig = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
      migrationsRun: false,
      logging: true,
      entities: [join(__dirname, `../**/*.entity.${fileExtension}`)],
      migrations: [join(__dirname, `../database/migrations/*.${fileExtension}`)],
    } as TypeOrmModuleOptions;
  } else {
    console.log('Environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USERNAME: process.env.DB_USERNAME,
      DB_NAME: process.env.DB_NAME,
      DB_SSL: process.env.DB_SSL,
      NODE_ENV: process.env.NODE_ENV
    });

    // Create a connection string to handle special characters in password
    const dbConfig = {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'younoch',
      password: process.env.DB_PASSWORD || 'rR%jrYKNqQdnYVQUkzuN',
      database: process.env.DB_NAME || 'property_rental_management_db',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
      migrationsRun: false,
      logging: true,
      entities: [join(__dirname, `../**/*.entity.${fileExtension}`)],
      migrations: [join(__dirname, `../database/migrations/*.${fileExtension}`)],
    } as TypeOrmModuleOptions;

    console.log('Database configuration:', {
      ...dbConfig,
      password: '***' // Don't log actual password
    });

    databaseConfig = dbConfig;
  }
}

export default databaseConfig;
