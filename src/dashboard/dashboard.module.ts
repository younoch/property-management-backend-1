import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Unit } from '../units/unit.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Invoice } from '../billing/invoices/entities/invoice.entity';
import { Expense } from '../expenses/expense.entity';
import { Lease } from '../leases/lease.entity';
import { Payment } from '../billing/payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Unit,
      Tenant,
      Invoice,
      Expense,
      Lease,
      Payment,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
