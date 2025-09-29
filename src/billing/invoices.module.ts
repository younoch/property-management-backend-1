// src/billing/invoices.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { LeaseCharge } from './lease-charge.entity';
import { Lease } from '../leases/lease.entity';
import { PaymentsModule } from './payments.module';
import { EmailModule } from '../email/email.module';
import { PdfModule } from '../pdf/pdf.module';
import { ConfigModule } from '@nestjs/config';
import { BillingModule } from './billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      LeaseCharge,
      Lease
    ]),
    forwardRef(() => BillingModule),
    forwardRef(() => PaymentsModule),
    EmailModule,
    PdfModule,
    ConfigModule
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService]
})
export class InvoicesModule {}
