// scripts/reset-db.prod.ts
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv({ path: path.resolve(process.cwd(), '.env.production') });

// Database configuration
const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || "postgresql://property_management_prod_user:UFdYYvhrmqg951EilaDpYgx0tOUq0dxX@dpg-d2b3s6ur433s739dv0qg-a/property_management_prod",
  ssl: { rejectUnauthorized: false },
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
});

async function resetDatabase() {
  const queryRunner = dataSource.createQueryRunner();
  
  try {
    await dataSource.initialize();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Get all user tables
    const tables = await queryRunner.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);

    // Drop all user tables
    await queryRunner.query(`
      DROP TABLE IF EXISTS ${tables.map(t => `"${t.tablename}"`).join(',')} CASCADE;
    `);

    await queryRunner.commitTransaction();
    await dataSource.runMigrations();
    console.log('✅ Database reset and migrations completed!');
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error resetting database:');
    console.error(error);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

resetDatabase();