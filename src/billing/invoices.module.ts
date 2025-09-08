import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoicesController, InvoicesGlobalController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { LeaseCharge } from './lease-charge.entity';
import { Lease } from '../tenancy/lease.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { PaymentsModule } from './payments.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { BillingModule } from './billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      LeaseCharge,
      Lease,
      Portfolio
    ]),
    forwardRef(() => BillingModule),
    forwardRef(() => PaymentsModule),
    PortfoliosModule,
    EmailModule,
    PdfModule,
    ConfigModule
  ],
  controllers: [InvoicesController, InvoicesGlobalController],
  providers: [
    InvoicesService,
    {
      provide: 'INVOICE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Invoice),
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
    InvoicesService,
    TypeOrmModule,
    'INVOICE_REPOSITORY',
    'LEASE_REPOSITORY',
    'PORTFOLIO_REPOSITORY'
  ]
})
export class InvoicesModule {}
