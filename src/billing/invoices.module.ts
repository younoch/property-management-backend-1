import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoicesController, InvoicesGlobalController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { LeaseCharge } from './lease-charge.entity';
import { Lease } from '../tenancy/lease.entity';
import { PaymentsModule } from './payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      LeaseCharge,
      Lease
    ]),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [InvoicesController, InvoicesGlobalController],
  providers: [InvoicesService],
  exports: [InvoicesService]
})
export class InvoicesModule {}
