import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { Portfolio } from './portfolio.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Lease } from '../leases/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { CommonModule } from '../common/common.module';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portfolio,
      Tenant,
      Lease,
      LeaseTenant
    ]),
    CommonModule
  ],
  controllers: [PortfoliosController],
  providers: [
    PortfoliosService,
    PortfolioScopeGuard,
  ],
  exports: [
    TypeOrmModule, 
    PortfoliosService,
    PortfolioScopeGuard,
  ],
})
export class PortfoliosModule {}


