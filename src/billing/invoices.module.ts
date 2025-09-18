// src/billing/invoices.module.ts
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
  ],
  exports: [
    InvoicesService,
  ]
})
export class InvoicesModule {}
