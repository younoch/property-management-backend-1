import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
// invoice scheduler removed in MVP
import { InvoicesController, InvoicesGlobalController } from './invoices.controller';
import { InvoiceItemsController, InvoiceItemsGlobalController } from './invoice-items.controller';
import { LeaseChargesController, LeaseChargesGlobalController } from './lease-charges.controller';
import { PaymentsController, PaymentsGlobalController } from './payments.controller';
import { InvoicesService } from './invoices.service';
import { InvoiceItemsService } from './invoice-items.service';
import { LeaseChargesService } from './lease-charges.service';
import { PaymentsService } from './payments.service';
import { LeaseBillingController } from './leases-billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeaseCharge, Invoice, InvoiceItem, Payment, PaymentApplication])],
  controllers: [
    InvoicesController,
    InvoicesGlobalController,
    InvoiceItemsController,
    InvoiceItemsGlobalController,
    LeaseChargesController,
    LeaseChargesGlobalController,
    PaymentsController,
    PaymentsGlobalController,
  LeaseBillingController,
  ],
  providers: [
    InvoicesService,
    InvoiceItemsService,
    LeaseChargesService,
    PaymentsService,
  ],
  exports: [TypeOrmModule.forFeature([LeaseCharge, Invoice, InvoiceItem, Payment])],
})
export class BillingModule {}


