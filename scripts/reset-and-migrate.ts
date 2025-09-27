import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

async function resetAndMigrate() {
  // Load environment variables
  config({ path: path.join(__dirname, '../.env') });

  // Create a new connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    migrationsRun: false,
  });

  try {
    // Initialize the connection
    await dataSource.initialize();
    console.log('Connected to the database');

    // Drop the public schema
    console.log('Dropping public schema...');
    await dataSource.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO PUBLIC;
      GRANT ALL ON SCHEMA public TO CURRENT_USER;
    `);
    console.log('Public schema reset successfully');

    // Run migrations
    console.log('Running migrations...');
    await dataSource.runMigrations({ transaction: 'all' });
    console.log('Migrations completed successfully');

    console.log('Database reset and migrations completed successfully!');
  } catch (error) {
    console.error('Error during database reset and migration:', error);
    process.exit(1);
  } finally {
    // Close the connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

resetAndMigrate().catch(console.error);
