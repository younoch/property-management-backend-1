import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
import { Lease } from '../tenancy/lease.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
// invoice scheduler removed in MVP
import { InvoicesController, InvoicesGlobalController } from './invoices.controller';
import { PaymentsController, PaymentsGlobalController } from './payments.controller';
import { InvoiceEmailController } from './controllers/invoice-email.controller';
import { InvoicesService } from './invoices.service';
import { PaymentsService } from './payments.service';
import { InvoiceEmailService } from './services/invoice-email.service';
import { LeaseBillingController } from './leases-billing.controller';
import { AuditLogModule } from '../common/audit-log.module';
import { LeaseToInvoiceMapper } from './lease-to-invoice.mapper';
import { LeaseChargesModule } from './lease-charges.module';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice, 
      Payment, 
      PaymentApplication
    ]),
    TypeOrmModule.forFeature([Lease], 'default'),
    TypeOrmModule.forFeature([Portfolio], 'default'),
    LeaseChargesModule,
    AuditLogModule,
    EmailModule,
    PdfModule,
  ],
  controllers: [
    InvoicesController,
    InvoicesGlobalController,
    PaymentsController,
    PaymentsGlobalController,
    LeaseBillingController,
    InvoiceEmailController,
  ],
  providers: [
    InvoicesService,
    PaymentsService,
    InvoiceEmailService,
    LeaseToInvoiceMapper
  ],
  exports: [
    TypeOrmModule.forFeature([
      Invoice, 
      Payment
    ]),
    TypeOrmModule.forFeature([Lease], 'default'),
    TypeOrmModule.forFeature([Portfolio], 'default'),
    LeaseToInvoiceMapper,
  ],
})
export class BillingModule {}


