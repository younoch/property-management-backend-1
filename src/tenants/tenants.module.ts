// src/tenants/tenants.controller.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController, TenantsGlobalController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { Tenant } from './tenant.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { PortfoliosModule } from '../portfolios/portfolios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, LeaseTenant]),
    PortfoliosModule
  ],
  controllers: [TenantsController, TenantsGlobalController],
  providers: [TenantsService],
})
export class TenantsModule {}