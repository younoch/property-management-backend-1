import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentApplication } from './payment-application.entity';
import { Invoice } from './entities/invoice.entity';
import { PaymentsController, PaymentsGlobalController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentApplication,
      Invoice
    ]),
  ],
  controllers: [PaymentsController, PaymentsGlobalController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
