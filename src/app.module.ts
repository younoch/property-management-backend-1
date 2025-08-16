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
import { AccountsModule } from './accounts/accounts.module';
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
import { InvoiceItemsModule } from './billing/invoice-items.module';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoiceGenerationScheduler } from './billing/invoice-generation.scheduler';
import { BillingModule } from './billing/billing.module';
import { HealthModule } from './health/health.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CsrfModule } from './modules/csrf.module';
import { User } from './users/user.entity';
// Report module/entities removed in new schema
import { Account } from './accounts/account.entity';
import { Property } from './properties/property.entity';
import { Notification } from './notifications/notification.entity';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { loggerConfig } from './logger/logger.config';
import { validate } from './config/env.validation';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : `.env.${process.env.NODE_ENV}`,
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
        const sslEnabled = config.get<boolean>('DB_SSL', false);
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
    AccountsModule,
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
    InvoiceItemsModule,
    NotificationsModule,
    HealthModule,
    MonitoringModule,
    CsrfModule,
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
