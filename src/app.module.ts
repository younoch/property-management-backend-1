import { Module, ValidationPipe, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Import with require to avoid TypeScript module resolution issues
const { ThrottlerModule } = require('@nestjs/throttler');
const { WinstonModule } = require('nest-winston');
const { CacheModule } = require('@nestjs/cache-manager');
const { ScheduleModule } = require('@nestjs/schedule');
const cookieParser = require('cookie-parser');
const path = require('path');

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

// Entities
import { Portfolio } from './portfolios/portfolio.entity';
import { LeaseCharge } from './billing/lease-charge.entity';

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
    ThrottlerModule.forRoot([{
      ttl: 60000,   // milliseconds (1 minute)
      limit: 100,
    }]),

    // Logging
    WinstonModule.forRoot(loggerConfig),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // seconds
    }),

    // Database
    // Import Portfolio module first to ensure entities are loaded in correct order
    PortfoliosModule,
    
    // Database configuration
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        const entities = [
          path.join(process.cwd(), 'dist/**/*.entity.js'),
          path.join(process.cwd(), 'dist/portfolios/portfolio.entity.js')
        ];
        
        console.log('Loading entities from paths:', entities);
        
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<number>('DB_PORT') || 5432),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          synchronize: config.get<boolean>('DB_SYNC', true),
          entities: entities,
          logging: ['error', 'warn', 'schema'],
          logger: 'advanced-console',
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),

    // Feature Modules
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
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
