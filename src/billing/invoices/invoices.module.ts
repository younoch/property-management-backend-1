import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { Invoice } from './entities/invoice.entity';
import { LeaseCharge } from '../lease-charges/entities/lease-charge.entity';
import { Lease } from '../../leases/lease.entity';
import { Portfolio } from '../../portfolios/portfolio.entity';

// Modules
import { PaymentsModule } from '../payments/payments.module';
import { EmailModule } from '../../email/email.module';
import { PdfModule } from '../../pdf/pdf.module';

// Controllers and Services
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      LeaseCharge,
      Lease,
      Portfolio
    ]),
    forwardRef(() => PaymentsModule),
    EmailModule,
    PdfModule,
    ConfigModule
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService, TypeOrmModule]
})
export class InvoicesModule {}
