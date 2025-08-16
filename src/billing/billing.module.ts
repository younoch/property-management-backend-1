import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';
import { InvoiceGenerationScheduler } from './invoice-generation.scheduler';
import { InvoicesController, InvoicesGlobalController } from './invoices.controller';
import { InvoiceItemsController, InvoiceItemsGlobalController } from './invoice-items.controller';
import { LeaseChargesController, LeaseChargesGlobalController } from './lease-charges.controller';
import { PaymentsController, PaymentsGlobalController } from './payments.controller';
import { InvoicesService } from './invoices.service';
import { InvoiceItemsService } from './invoice-items.service';
import { LeaseChargesService } from './lease-charges.service';
import { PaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeaseCharge, Invoice, InvoiceItem, Payment])],
  controllers: [
    InvoicesController,
    InvoicesGlobalController,
    InvoiceItemsController,
    InvoiceItemsGlobalController,
    LeaseChargesController,
    LeaseChargesGlobalController,
    PaymentsController,
    PaymentsGlobalController,
  ],
  providers: [
    InvoicesService,
    InvoiceItemsService,
    LeaseChargesService,
    PaymentsService,
    InvoiceGenerationScheduler,
  ],
  exports: [TypeOrmModule.forFeature([LeaseCharge, Invoice, InvoiceItem, Payment])],
})
export class BillingModule {}


