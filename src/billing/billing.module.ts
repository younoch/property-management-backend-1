import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
// invoice scheduler removed in MVP
import { InvoicesController, InvoicesGlobalController } from './invoices.controller';
import { PaymentsController, PaymentsGlobalController } from './payments.controller';
import { InvoicesService } from './invoices.service';
import { PaymentsService } from './payments.service';
import { LeaseBillingController } from './leases-billing.controller';
import { AuditLogModule } from '../common/audit-log.module';
import { LeaseToInvoiceMapper } from './lease-to-invoice.mapper';
import { LeaseChargesModule } from './lease-charges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice, 
      Payment, 
      PaymentApplication
    ]),
    LeaseChargesModule,
    AuditLogModule,
  ],
  controllers: [
    InvoicesController,
    InvoicesGlobalController,
    PaymentsController,
    PaymentsGlobalController,
    LeaseBillingController,
  ],
  providers: [
    InvoicesService,
    PaymentsService,
    LeaseToInvoiceMapper
  ],
  exports: [
    TypeOrmModule.forFeature([Invoice, Payment]),
    LeaseToInvoiceMapper,
  ],
})
export class BillingModule {}


