import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
import { Invoice } from './entities/invoice.entity';
import { PaymentsController, PaymentsGlobalController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AuditLogModule } from '../common/audit-log.module';
import { BillingModule } from './billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentApplication,
      Invoice,
    ]),
    forwardRef(() => BillingModule),
    forwardRef(() => AuditLogModule), // Provides AuditLogService
  ],
  controllers: [PaymentsController, PaymentsGlobalController],
  providers: [
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
    PaymentsService, // Injects AuditLogService automatically
  ],
  exports: [
    PaymentsService,
    TypeOrmModule,
    'PAYMENT_REPOSITORY',
    'PAYMENT_APPLICATION_REPOSITORY',
    'INVOICE_REPOSITORY',
  ],
})
export class PaymentsModule {}
