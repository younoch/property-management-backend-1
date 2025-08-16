import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaseChargesController } from './lease-charges.controller';
import { LeaseChargesService } from './lease-charges.service';
import { LeaseCharge } from './lease-charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaseCharge])],
  controllers: [LeaseChargesController],
  providers: [LeaseChargesService],
})
export class LeaseChargesModule {}


