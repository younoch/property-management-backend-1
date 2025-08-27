import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
// invoice scheduler removed in MVP
import { InvoicesController, InvoicesGlobalController } from './invoices.controller';
import { LeaseChargesController, LeaseChargesGlobalController } from './lease-charges.controller';
import { PaymentsController, PaymentsGlobalController } from './payments.controller';
import { InvoicesService } from './invoices.service';
import { LeaseChargesService } from './lease-charges.service';
import { PaymentsService } from './payments.service';
import { LeaseBillingController } from './leases-billing.controller';
import { AuditLogModule } from '../common/audit-log.module';
import { LeaseToInvoiceMapper } from './lease-to-invoice.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaseCharge, Invoice, Payment, PaymentApplication]),
    AuditLogModule,
  ],
  controllers: [
    InvoicesController,
    InvoicesGlobalController,
    LeaseChargesController,
    LeaseChargesGlobalController,
    PaymentsController,
    PaymentsGlobalController,
    LeaseBillingController,
  ],
  providers: [
    InvoicesService,
    LeaseChargesService,
    PaymentsService,
    LeaseToInvoiceMapper,
  ],
  exports: [
    TypeOrmModule.forFeature([LeaseCharge, Invoice, Payment]),
    LeaseToInvoiceMapper,
  ],
})
export class BillingModule {}


