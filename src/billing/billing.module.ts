import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
import { Lease } from '../tenancy/lease.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { InvoiceEmailController } from './controllers/invoice-email.controller';
import { InvoiceEmailService } from './services/invoice-email.service';
import { LeaseBillingController } from './leases-billing.controller';
import { AuditLogModule } from '../common/audit-log.module';
import { LeaseToInvoiceMapper } from './lease-to-invoice.mapper';
import { LeaseChargesModule } from './lease-charges.module';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';
import { InvoicesModule } from './invoices.module';
import { PaymentsModule } from './payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      Payment,
      PaymentApplication,
      Lease,
      Portfolio
    ]),
    forwardRef(() => InvoicesModule),
    forwardRef(() => PaymentsModule),
    LeaseChargesModule,
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


