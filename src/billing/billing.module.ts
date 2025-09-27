// src/billing/billing.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Controllers and services
import { InvoiceEmailController } from './controllers/invoice-email.controller';
import { InvoiceEmailService } from './services/invoice-email.service';
import { LeaseBillingController } from './controllers/leases-billing.controller';
import { LeaseToInvoiceMapper } from './mappers/lease-to-invoice.mapper';

// Modules
import { AuditLogModule } from '../common/audit-log.module';
import { LeaseChargesModule } from './lease-charges.module';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';
import { InvoicesModule } from './invoices.module';
import { PaymentsModule } from './payments.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';

// Entities
import { Invoice } from './entities/invoice.entity';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
import { Lease } from '../tenancy/lease.entity';
import { Portfolio } from '../portfolios/portfolio.entity';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PortfoliosModule),
    TypeOrmModule.forFeature([
      Invoice,
      Payment,
      PaymentApplication,
      Lease,
      Portfolio,
    ]),
    forwardRef(() => InvoicesModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => LeaseChargesModule),
    AuditLogModule,
    EmailModule,
    PdfModule,
  ],
  controllers: [LeaseBillingController, InvoiceEmailController],
  providers: [InvoiceEmailService, LeaseToInvoiceMapper],
  exports: [
    TypeOrmModule,
    InvoiceEmailService,
    LeaseToInvoiceMapper,
  ],
})
export class BillingModule {}
