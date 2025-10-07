import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaseCharge } from './entities/lease-charge.entity';
import { LeaseChargesService } from './lease-charges.service';
import { LeaseChargesController, LeaseChargesGlobalController } from './lease-charges.controller';
import { PropertiesModule } from '../../properties/properties.module';
import { Lease } from '../../leases/lease.entity';
import { Portfolio } from '../../portfolios/portfolio.entity';
import { Unit } from '../../units/unit.entity';
import { Property } from '../../properties/property.entity';
import { Tenant } from '../../tenants/tenant.entity';
import { LeaseTenant } from '../../tenancy/lease-tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaseCharge, Lease, Portfolio, Unit, Property, Tenant, LeaseTenant]),
    PropertiesModule
  ],
  providers: [LeaseChargesService],
  controllers: [LeaseChargesController, LeaseChargesGlobalController],
  exports: [LeaseChargesService, TypeOrmModule]
})
export class LeaseChargesModule {}
