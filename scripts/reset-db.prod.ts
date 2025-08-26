// scripts/reset-db.prod.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { config as loadEnv } from 'dotenv';

// Load environment variables from .env.production if it exists
loadEnv({ path: path.resolve(process.cwd(), '.env.production') });
const DATABASE_URL = "postgresql://property_management_prod_user:UFdYYvhrmqg951EilaDpYgx0tOUq0dxX@dpg-d2b3s6ur433s739dv0qg-a/property_management_prod"

// TypeORM configuration
const dataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  migrationsRun: false,
  logging: true,
});

async function resetProductionDatabase() {
  if (!DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Initializing production database connection...');
    
    // Initialize the data source
    await dataSource.initialize();
    
    // Get database name from URL
    const dbUrl = new URL(DATABASE_URL);
    const dbName = dbUrl.pathname.substring(1);
    const adminDbUrl = `${dbUrl.origin}/postgres`; // Connect to default postgres database

    console.log(`Resetting database: ${dbName}`);
    
    // Create a new connection to the admin database
    const adminDataSource = new DataSource({
      type: 'postgres',
      url: adminDbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    await adminDataSource.initialize();
    
    // Drop and recreate the database
    await adminDataSource.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    await adminDataSource.query(`CREATE DATABASE "${dbName}"`);
    
    // Close the admin connection
    await adminDataSource.destroy();
    
    // Run migrations
    console.log('Running migrations...');
    await dataSource.runMigrations();
    
    console.log('✅ Database reset and migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:');
    console.error(error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

resetProductionDatabase();