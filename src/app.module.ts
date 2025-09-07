import { Module, ValidationPipe, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { PropertiesModule } from './properties/properties.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UnitsModule } from './units/units.module';
import { TenantsModule } from './tenants/tenants.module';
import { LeasesModule } from './leases/leases.module';
import { InvoicesModule } from './billing/invoices.module';
import { PaymentsModule } from './billing/payments.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DocumentsModule } from './documents/documents.module';
import { LeaseChargesModule } from './billing/lease-charges.module';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoiceGenerationScheduler } from './billing/invoice-generation.scheduler';
import { BillingModule } from './billing/billing.module';
import { HealthModule } from './health/health.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CsrfModule } from './modules/csrf.module';
import { User } from './users/user.entity';
// Report module/entities removed in new schema
import { Portfolio } from './portfolios/portfolio.entity';
import { Property } from './properties/property.entity';
import { Notification } from './notifications/notification.entity';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { loggerConfig } from './logger/logger.config';
import { validate } from './config/env.validation';
import * as cookieParser from 'cookie-parser';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' 
        ? '.env.production' 
        : process.env.NODE_ENV 
          ? `.env.${process.env.NODE_ENV}` 
          : '.env.development',
      validate,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    WinstonModule.forRoot(loggerConfig),
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = (config.get<string>('NODE_ENV') || process.env.NODE_ENV) === 'production';
        const sslEnabled = isProduction && (config.get<string>('DB_SSL') === 'true');
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          synchronize: config.get<boolean>('DB_SYNC', true),
          autoLoadEntities: true,
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    UsersModule,
    PortfoliosModule,
    PropertiesModule,
    UnitsModule,
    TenantsModule,
    LeasesModule,
    InvoicesModule,
    BillingModule,
    PaymentsModule,
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
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
