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
    synchronize: true,
    logging: false,
    entities: [join(__dirname, `../**/*.entity.${fileExtension}`)],
  } as TypeOrmModuleOptions;
} else if (isProduction) {
  databaseConfig = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    autoLoadEntities: true,
    synchronize: process.env.DB_SYNC === 'true',
    migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
    logging: false,
    entities: [join(__dirname, `../**/*.entity.${fileExtension}`)],
    migrations: [join(__dirname, `../database/migrations/*.${fileExtension}`)],
  } as TypeOrmModuleOptions;
} else {
  databaseConfig = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD || 'rR%jrYKNqQdnYVQUkzuN',
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    autoLoadEntities: true,
    synchronize: process.env.DB_SYNC === 'true',
    migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
    logging: false,
    entities: [join(__dirname, `../**/*.entity.${fileExtension}`)],
    migrations: [join(__dirname, `../database/migrations/*.${fileExtension}`)],
  } as TypeOrmModuleOptions;
}

export default databaseConfig;
