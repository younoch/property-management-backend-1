import { DataSource } from 'typeorm';
import * as path from 'path';
import { execSync } from 'child_process';

// Database configuration - using localhost to connect to the database
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'property_rental_management_db',
  // Using connection string with the correct password
  connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
};

async function resetDatabase() {
  try {
    console.log('Initializing database connection...');
    // Create a connection to the postgres database to drop/create the target database
    const adminDataSource = new DataSource({
      type: 'postgres',
      url: DB_CONFIG.connectionString, // Using connection string for better handling of special chars
      ssl: false,
      logging: true
    });

    await adminDataSource.initialize();
    
    console.log('Dropping database...');
    await adminDataSource.query(`DROP DATABASE IF EXISTS "${DB_CONFIG.database}"`);
    
    console.log('Creating database...');
    await adminDataSource.query(`CREATE DATABASE "${DB_CONFIG.database}"`);
    
    await adminDataSource.destroy();
    
    console.log('Running migrations...');
    // Run migrations using the TypeORM CLI with explicit connection details
    const env = {
      ...process.env,
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'postgres',  // Using container's default password
      DB_NAME: 'property_rental_management_db',
      NODE_ENV: 'development',
      DB_SYNC: 'false',
      // Add PG environment variables for direct psql commands
      PGHOST: 'localhost',
      PGPORT: '5432',
      PGUSER: 'postgres',
      PGPASSWORD: 'postgres',  // Using container's default password
      PGDATABASE: 'postgres'
    };

    console.log('Running migrations with the following config:');
    console.log(`- Host: ${env.DB_HOST}`);
    console.log(`- Port: ${env.DB_PORT}`);
    console.log(`- Database: ${env.DB_NAME}`);

    try {
      execSync('npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts', { 
        stdio: 'inherit',
        env
      });
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
    
    console.log('Database reset and migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
