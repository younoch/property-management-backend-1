import { Module, ValidationPipe, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from '@/guards/auth.guard';
import { join } from 'path';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import cookieParser from 'cookie-parser';

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
import { ExpensesModule } from './expenses/expenses.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './common/audit.module';

// Interceptors, Filters & Logger
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { loggerConfig } from './logger/logger.config';
import { validate } from './config/env.validation';
import databaseConfig from './config/database';

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
      ttl: 60,
      limit: 100,
    } as unknown as ThrottlerModuleOptions),

    // Logging
    WinstonModule.forRoot(loggerConfig),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
    }),

    // Feature modules
    PortfoliosModule,

    // Database (combined local + production)
    TypeOrmModule.forRoot(databaseConfig),

    // Other feature modules
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
    ExpensesModule,
    DashboardModule,
    AuditModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
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
