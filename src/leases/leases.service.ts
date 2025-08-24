// src/leases/leases.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Lease } from '../tenancy/lease.entity';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { Tenant } from '../tenancy/tenant.entity';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly repo: Repository<Lease>,
  @InjectRepository(LeaseTenant)
  private readonly leaseTenantRepo: Repository<LeaseTenant>,
  @InjectRepository(Tenant)
  private readonly tenantRepo: Repository<Tenant>,
  ) {}

  create(dto: CreateLeaseDto) {
    const lease = this.repo.create(dto as any);
    return this.repo.save(lease);
  }

  findAll() {
    return this.repo.find();
  }

  findByPortfolio(portfolioId: number) {
    return this.repo.find({ where: { portfolio_id: portfolioId } });
  }

  findByUnit(portfolioId: number, unitId: number) {
    return this.repo.find({ where: { portfolio_id: portfolioId, unit_id: unitId } });
  }

  async findOne(id: number) {
    const lease = await this.repo.findOne({ 
      where: { id },
      relations: [
        'leaseTenants',
        'leaseTenants.tenant'
      ]
    });
    if (!lease) throw new NotFoundException('Lease not found');
    return lease;
  }

  async update(id: number, dto: UpdateLeaseDto) {
    const lease = await this.findOne(id);
    Object.assign(lease, dto);
    return this.repo.save(lease);
  }

  async remove(id: number) {
    const lease = await this.findOne(id);
    await this.repo.remove(lease);
    return { success: true };
  }

  /**
   * Attach multiple tenants to a lease. Creates LeaseTenant rows for each tenant id.
   * Returns the list of attached tenants for the lease.
   */
  async attachTenants(leaseId: number, tenantIds: number[]) {
    const lease = await this.findOne(leaseId);

    // validate tenants exist
    const tenants = await this.tenantRepo.find({ where: { id: In(tenantIds) } });
    const foundIds = new Set(tenants.map(t => t.id));
    const missing = tenantIds.filter(id => !foundIds.has(id));
    if (missing.length) {
      throw new NotFoundException(`Tenants not found: ${missing.join(',')}`);
    }

    // create unique pairs and avoid duplicates
    const toInsert: LeaseTenant[] = [];
    for (const tenantId of tenantIds) {
      const exists = await this.leaseTenantRepo.findOne({ where: { lease_id: leaseId, tenant_id: tenantId } });
      if (!exists) {
  const lt: LeaseTenant = { lease_id: leaseId, tenant_id: tenantId } as any;
  toInsert.push(lt);
      }
    }

    if (toInsert.length) {
      // use insert for bulk create to satisfy typings
      await this.leaseTenantRepo.insert(toInsert as any);
    }

    return this.leaseTenantRepo.find({ where: { lease_id: leaseId }, relations: ['tenant'] });
  }

  /**
   * Activate a lease: must be in 'draft' and have at least one attached tenant.
   */
  async activate(leaseId: number) {
    const lease = await this.findOne(leaseId);

    if (lease.status !== 'draft') {
      throw new Error('Only leases in draft status can be activated');
    }

    const attached = await this.leaseTenantRepo.find({ where: { lease_id: leaseId } });
    if (!attached || attached.length === 0) {
      throw new Error('Cannot activate lease without at least one tenant attached');
    }

    lease.status = 'active';
    await this.repo.save(lease);
    return lease;
  }
}


