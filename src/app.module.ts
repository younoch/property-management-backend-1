import { Module, ValidationPipe, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'; // ✅ import here
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { join } from 'path';
const { ThrottlerModule } = require('@nestjs/throttler');
const { WinstonModule } = require('nest-winston');
const { CacheModule } = require('@nestjs/cache-manager');
const { ScheduleModule } = require('@nestjs/schedule');
const cookieParser = require('cookie-parser');

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature Modules
import { UsersModule } from './users/users.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { PropertiesModule } from './properties/properties.module';
import { UnitsModule } from './units/units.module';
import { TenantsModule } from './tenants/tenants.module';
import { LeasesModule } from './leases/leases.module';
import { BillingModule } from './billing/billing.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DocumentsModule } from './documents/documents.module';
import { LeaseChargesModule } from './billing/lease-charges.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CsrfModule } from './modules/csrf.module';
import { FeedbackModule } from './feedback/feedback.module';

// Interceptors, Filters & Logger
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { loggerConfig } from './logger/logger.config';
import { validate } from './config/env.validation';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validate,
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot({
      ttl: 60, // seconds
      limit: 100,
    }),

    // Logging
    WinstonModule.forRoot(loggerConfig),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // seconds
    }),

    // Feature modules
    PortfoliosModule,


    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: isProduction ? undefined : configService.get('DB_HOST'),
          port: isProduction ? undefined : parseInt(configService.get('DB_PORT') || '5432'),
          username: isProduction ? undefined : configService.get('DB_USERNAME'),
          password: isProduction ? undefined : configService.get('DB_PASSWORD'),
          database: isProduction ? undefined : configService.get('DB_NAME'),
          url: isProduction ? configService.get('DATABASE_URL') : undefined,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: configService.get('DB_SYNC') === 'true',
          migrationsRun: configService.get('RUN_MIGRATIONS_ON_BOOT') === 'true',
          logging: true,
          entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
          migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
        };
      },
    }),

    UsersModule,
    PropertiesModule,
    UnitsModule,
    TenantsModule,
    LeasesModule,
    BillingModule,
    MaintenanceModule,
    DocumentsModule,
    LeaseChargesModule,
    NotificationsModule,
    HealthModule,
    MonitoringModule,
    CsrfModule,
    FeedbackModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
