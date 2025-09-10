import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🌱 Using production DB?', isProduction);

const databaseConfig: TypeOrmModuleOptions = isProduction
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }, // Configurable SSL for production
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
      migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
      logging: false,
      entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
      migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
      migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
      logging: true,
      entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
      migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
    };

console.log('📝 databaseConfig:', JSON.stringify(databaseConfig, null, 2));

export default databaseConfig;
