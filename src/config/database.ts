import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { join } from 'path';
import 'dotenv/config';
import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Make sure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is not defined in environment variables.');
}

// 🔍 Simple connection test with pg
async function testConnection() {
  console.log('== DATABASE CONNECTION TEST ==');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}
testConnection();

// Final TypeORM config
const databaseConfig: TypeOrmModuleOptions & PostgresConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  extra: {
    ssl: { rejectUnauthorized: false },
  },
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: process.env.DB_SYNC === 'true',
  migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
  autoLoadEntities: true,
  logging: !isProduction && !isTest ? 'all' : ['error'],
};

export default databaseConfig;
