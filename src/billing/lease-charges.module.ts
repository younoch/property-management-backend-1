import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { LeaseChargesService } from './lease-charges.service';
import { LeaseChargesController, LeaseChargesGlobalController } from './lease-charges.controller';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaseCharge]),
    PropertiesModule
  ],
  providers: [LeaseChargesService],
  controllers: [LeaseChargesController, LeaseChargesGlobalController],
  exports: [LeaseChargesService, TypeOrmModule]
})
export class LeaseChargesModule {}
