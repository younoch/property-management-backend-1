// scripts/reset-db.prod.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { config as loadEnv } from 'dotenv';

// Load environment variables from .env.production if it exists
loadEnv({ path: path.resolve(process.cwd(), '.env.production') });

// Use the internal Render database URL
const DATABASE_URL = "postgresql://property_management_prod_user:UFdYYvhrmqg951EilaDpYgx0tOUq0dxX@dpg-d2b3s6ur433s739dv0qg-a/property_management_prod";

// TypeORM configuration
const dataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Always use SSL in production
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  migrationsRun: false,
  logging: true,
});

async function resetProductionDatabase() {
  try {
    console.log('Initializing production database connection...');
    
    // Initialize the data source
    await dataSource.initialize();
    console.log('Connected to the database');
    
    // Drop all tables
    console.log('Dropping all tables...');
    await dataSource.dropDatabase();
    console.log('All tables dropped');
    
    // Run migrations
    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations completed successfully');
    
    // Close the connection
    await dataSource.destroy();
    console.log('Database reset completed successfully');
    
  } catch (error) {
    console.error('❌ Error resetting database:');
    console.error(error);
    process.exit(1);
  }
}

resetProductionDatabase();