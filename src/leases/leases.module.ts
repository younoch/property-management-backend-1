// src/leases/leases.controller.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeasesController, LeasesGlobalController } from './leases.controller';
import { LeasesService } from './leases.service';
import { Lease } from '../tenancy/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { Tenant } from '../tenancy/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lease, LeaseTenant, Tenant])],
  controllers: [LeasesController, LeasesGlobalController],
  providers: [LeasesService],
})
export class LeasesModule {}


