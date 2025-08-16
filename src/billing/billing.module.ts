import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceGenerationScheduler } from './invoice-generation.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([LeaseCharge, Invoice, InvoiceItem])],
  providers: [InvoiceGenerationScheduler],
})
export class BillingModule {}


