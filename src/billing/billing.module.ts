// src/billing/billing.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Controllers and services
import { InvoiceEmailController } from './invoices/controllers/invoice-email.controller';
import { InvoiceEmailService } from './invoices/services/invoice-email.service';
import { LeaseBillingController } from './invoices/controllers/leases-billing.controller';
import { LeaseToInvoiceMapper } from './invoices/mappers/lease-to-invoice.mapper';

// Modules
import { AuditLogModule } from '../common/audit-log.module';
import { LeaseChargesModule } from './lease-charges/lease-charges.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { EmailModule } from '../email/email.module'

// Entities
import { Invoice } from './invoices/entities/invoice.entity';
import { Payment } from './payments/entities/payment.entity';
import { PaymentApplication } from './payments/entities/payment-application.entity';
import { Lease } from '../leases/lease.entity';
import { PdfService } from '../pdf/pdf.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PortfoliosModule),
    TypeOrmModule.forFeature([
      Invoice,
      Payment,
      PaymentApplication,
      Lease,
    ]),
    forwardRef(() => InvoicesModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => LeaseChargesModule),
    forwardRef(() => EmailModule),
  ],
  controllers: [LeaseBillingController, InvoiceEmailController],
  providers: [InvoiceEmailService, LeaseToInvoiceMapper, PdfService],
  exports: [
    TypeOrmModule,
    InvoiceEmailService,
    LeaseToInvoiceMapper,
  ],
})
export class BillingModule {}
