import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Entities
import { Payment } from './entities/payment.entity';
import { PaymentApplication } from './entities/payment-application.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Lease } from '../../leases/lease.entity';
import { LeaseTenant } from '../../tenancy/lease-tenant.entity';

// Modules
import { AuditLogModule } from '../../common/audit-log.module';

// Controllers and Services
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

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
  ],
  controllers: [PaymentsController],
  providers: [
    {
      provide: 'DATA_SOURCE',
      useFactory: (dataSource: DataSource) => dataSource,
      inject: [DataSource],
    },
    {
      provide: 'PAYMENT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Payment),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'PAYMENT_APPLICATION_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(PaymentApplication),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'INVOICE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Invoice),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'LEASE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Lease),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'LEASE_TENANT_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(LeaseTenant),
      inject: ['DATA_SOURCE'],
    },
    PaymentsService,
    PaymentsService,
  ],
  exports: [
    PaymentsService,
    TypeOrmModule,
  ],
})
export class PaymentsModule {}
