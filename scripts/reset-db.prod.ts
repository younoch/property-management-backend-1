// scripts/reset-db.prod.ts
import { DataSource } from 'typeorm';
import * as path from 'path';
import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv({ path: path.resolve(process.cwd(), '.env.production') });

// Database configuration
const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
});

async function resetDatabase() {
  console.log('Initializing database connection...');
  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('Dropping all tables...');
    
    // Disable foreign key checks
    await queryRunner.query('SET session_replication_role = "replica";');

    // Get all user tables
    const tables = await queryRunner.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT IN ('migrations', 'migrations_typeorm')
    `);

    // Drop all tables
    for (const table of tables) {
      try {
        console.log(`Dropping table: ${table.tablename}`);
        await queryRunner.query(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
      } catch (error) {
        console.error(`Error dropping table ${table.tablename}:`, error.message);
      }
    }

    // Reset migrations
    console.log('Resetting migrations...');
    await queryRunner.query('DROP TABLE IF EXISTS migrations CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS migrations_typeorm CASCADE');

    // Re-enable foreign key checks
    await queryRunner.query('SET session_replication_role = "origin";');

    await queryRunner.commitTransaction();
    console.log('Database reset successfully!');

    // Run migrations
    console.log('Running migrations...');
    await dataSource.runMigrations({ transaction: 'all' });
    console.log('Migrations completed successfully!');

  } catch (error) {
    console.error('Error during database reset:', error);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

// Main execution
async function main() {
  try {
    await resetDatabase();
    console.log('✅ Database reset and migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:');
    console.error(error);
    process.exit(1);
  }
}

// Start the script
main().catch(error => {
  console.error('Unhandled error in main:', error);
  process.exit(1);
});