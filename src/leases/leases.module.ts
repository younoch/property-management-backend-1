import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeasesController, LeasesGlobalController } from './leases.controller';
import { LeasesService } from './leases.service';
import { Lease } from '../tenancy/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { Tenant } from '../tenancy/tenant.entity';
import { Unit } from '../units/unit.entity';
import { LeaseMapper } from '../tenancy/mappers/lease.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Lease, LeaseTenant, Tenant, Unit])],
  controllers: [LeasesController, LeasesGlobalController],
  providers: [
    LeasesService,
    LeaseMapper
  ],
})
export class LeasesModule {}


