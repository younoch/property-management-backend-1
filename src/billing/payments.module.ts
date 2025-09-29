import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
import { Invoice } from './entities/invoice.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AuditLogModule } from '../common/audit-log.module';
import { Lease } from '../leases/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { BillingModule } from './billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentApplication,
      Invoice,
      Lease,
      LeaseTenant,
    ]),
    AuditLogModule,
    forwardRef(() => BillingModule),
  ],
  controllers: [
    PaymentsController
  ],
  providers: [
    PaymentsService,
    {
      provide: 'DATA_SOURCE',
      useFactory: (dataSource: DataSource) => dataSource,
      inject: [DataSource],
    },
    {
      provide: 'PAYMENT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Payment),
      inject: [DataSource],
    },
    {
      provide: 'PAYMENT_APPLICATION_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(PaymentApplication),
      inject: [DataSource],
    },
    {
      provide: 'INVOICE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Invoice),
      inject: [DataSource],
    },
    {
      provide: 'LEASE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Lease),
      inject: [DataSource],
    },
    {
      provide: 'LEASE_TENANT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(LeaseTenant),
      inject: [DataSource],
    },
    PaymentsService,
  ],
  exports: [
    PaymentsService,
    TypeOrmModule,
  ],
})
export class PaymentsModule {}
