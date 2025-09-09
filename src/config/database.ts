import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const databaseConfig: TypeOrmModuleOptions = isProduction
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL, // Render / Neon DATABASE_URL
      ssl: { rejectUnauthorized: false }, // SSL required in production
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
      migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
      logging: false,
      entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
      migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'mydb',
      ssl: false, // local connection doesn't need SSL
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
      migrationsRun: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
      logging: true,
      entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
      migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
    };
