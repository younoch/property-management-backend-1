import { Module, forwardRef, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

// Import controllers and services
import { InvoiceEmailController } from './controllers/invoice-email.controller';
import { InvoiceEmailService } from './services/invoice-email.service';
import { LeaseBillingController } from './leases-billing.controller';
import { LeaseToInvoiceMapper } from './lease-to-invoice.mapper';

// Import modules
import { AuditLogModule } from '../common/audit-log.module';
import { LeaseChargesModule } from './lease-charges.module';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';
import { InvoicesModule } from './invoices.module';
import { PaymentsModule } from './payments.module';

// Import entity classes with regular imports for runtime usage
import { Invoice } from './entities/invoice.entity';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
import { Lease } from '../tenancy/lease.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

@Module({
  imports: [
    ConfigModule,
    // Import PortfoliosModule to ensure Portfolio entity is loaded first
    forwardRef(() => import('../portfolios/portfolios.module').then(m => m.PortfoliosModule)),
    TypeOrmModule.forFeature([
      // Using type assertions to handle string entity names
      'Invoice' as any,
      'Payment' as any,
      'PaymentApplication' as any,
      'Lease' as any,
      'LeaseCharge' as any,
      'Portfolio' as any
    ]),
    forwardRef(() => InvoicesModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => LeaseChargesModule),
    AuditLogModule,
    EmailModule,
    PdfModule,
  ],
  controllers: [
    LeaseBillingController,
    InvoiceEmailController,
  ],
  providers: [
    InvoiceEmailService,
    LeaseToInvoiceMapper,
    {
      provide: 'DATA_SOURCE',
      useFactory: async (configService: ConfigService) => {
        const options: DataSourceOptions = {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          entities: [
            'dist/**/*.entity.js',
            'dist/portfolios/portfolio.entity.js'
          ],
          synchronize: configService.get('DB_SYNC') === 'true',
          logging: configService.get('DB_LOGGING') === 'true',
          ssl: configService.get<string>('NODE_ENV') === 'production' 
            ? { rejectUnauthorized: false }
            : false,
        };
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        return dataSource;
      },
      inject: [ConfigService],
    },
    {
      provide: 'INVOICE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Invoice),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'PAYMENT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Payment),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'LEASE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Lease),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'PORTFOLIO_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Portfolio),
      inject: ['DATA_SOURCE'],
    },
  ],
  exports: [
    TypeOrmModule,
    InvoiceEmailService,
    LeaseToInvoiceMapper,
    'DATA_SOURCE',
    'INVOICE_REPOSITORY',
    'LEASE_REPOSITORY',
    'PORTFOLIO_REPOSITORY'
  ]
})
export class BillingModule {}
