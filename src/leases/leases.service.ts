// src/leases/leases.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In, Not } from 'typeorm';

import { Lease } from './lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Unit } from '../units/unit.entity';
type UnitStatus = 'vacant' | 'occupied' | 'maintenance';
import { Portfolio } from '../portfolios/portfolio.entity';

import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly repo: Repository<Lease>,
    @InjectRepository(LeaseTenant)
    private readonly leaseTenantRepo: Repository<LeaseTenant>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Unit)
    private readonly unitRepo: Repository<Unit>,     // ⬅️ add
    private readonly dataSource: DataSource,         // ⬅️ add
  ) {}

  async create(dto: CreateLeaseDto): Promise<Lease> {
    const lease = this.repo.create(dto as any);
    const result = await this.repo.save(lease);
    // Since we're saving a single entity, we can safely cast the result to Lease
    return result as unknown as Lease;
  }

  findAll() {
    return this.repo.find();
  }

  async findByUnit(unitId: number): Promise<Lease[]> {
    return this.repo.find({ where: { unit_id: unitId } });
  }

  /**
   * Robust findOne that also fetches attached tenants regardless of entity relations.
   */
  async findOne(id: number) {
    const lease = await this.repo.findOne({ where: { id } });
    if (!lease) throw new NotFoundException('Lease not found');

    // Load attached tenants (works even if Lease doesn't have @OneToMany)
    const leaseTenants = await this.leaseTenantRepo.find({
      where: { lease_id: id },
      relations: ['tenant'],
    });
    // Use the same property name that's expected by the mapper (lease_tenants)
    (lease as any).lease_tenants = leaseTenants;

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
    // Ensure lease exists
    await this.findOne(leaseId);

    // validate tenants exist
    const tenants = await this.tenantRepo.find({ where: { id: In(tenantIds) } });
    const foundIds = new Set(tenants.map((t) => t.id));
    const missing = tenantIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      throw new NotFoundException(`Tenants not found: ${missing.join(',')}`);
    }

    // create unique pairs and avoid duplicates
    const toInsert: LeaseTenant[] = [];
    for (const tenantId of tenantIds) {
      const exists = await this.leaseTenantRepo.findOne({
        where: { lease_id: leaseId, tenant_id: tenantId },
      });
      if (!exists) {
        toInsert.push({ lease_id: leaseId, tenant_id: tenantId } as any);
      }
    }

    if (toInsert.length) {
      await this.leaseTenantRepo.insert(toInsert as any);
    }

    return this.leaseTenantRepo.find({
      where: { lease_id: leaseId },
      relations: ['tenant'],
    });
  }

  /**
   * Activate a lease:
   * - must be 'draft'
   * - must have ≥1 attached tenant
   * - unit must be currently 'vacant'
   * - no other active lease for the same unit
   * All changes happen in a single DB transaction.
   */
  async activate(leaseId: number) {
    // Reload with the fields we need
    const lease = await this.repo.findOne({ where: { id: leaseId } });
    if (!lease) throw new NotFoundException('Lease not found');

    if (lease.status !== 'draft') {
      throw new BadRequestException('Only leases in draft status can be activated');
    }

    // Require at least one attached tenant
    const attached = await this.leaseTenantRepo.count({ where: { lease_id: leaseId } });
    if (attached === 0) {
      throw new BadRequestException('Cannot activate lease without at least one tenant attached');
    }

    // Unit must be vacant at activation time
    const unit = await this.unitRepo.findOne({ where: { id: lease.unit_id } });
    if (!unit) throw new NotFoundException('Unit not found for this lease');
    if (unit.status !== 'vacant') {
      throw new ConflictException('Unit is not vacant; cannot activate lease');
    }

    // Optional: ensure no other ACTIVE lease exists for this unit
    const overlappingActive = await this.repo.count({
      where: { unit_id: lease.unit_id, status: 'active' as any },
    });
    if (overlappingActive > 0) {
      throw new ConflictException('Another active lease already exists for this unit');
    }

    // Transaction: set lease -> active, unit -> occupied
    await this.dataSource.transaction(async (manager) => {
      await manager.update(Lease, { id: leaseId }, { status: 'active' as any });
      await manager.update(Unit, { id: lease.unit_id }, { status: 'occupied' as any });
    });

    // Return fresh state (with attached tenants)
    return this.findOne(leaseId);
  }

  /**
   * End a lease on the provided date. If the provided date equals the lease's end_date,
   * mark the unit as 'vacant'. Runs in a transaction.
   */
  async endLease(leaseId: number, endDate: string) {
    // load lease
    const lease = await this.repo.findOne({ where: { id: leaseId } });
    if (!lease) throw new NotFoundException('Lease not found');

    // perform transaction: update lease end_date and status; if endDate equals lease.end_date (or we set it), update unit.status to 'vacant'
    await this.dataSource.transaction(async (manager) => {
      await manager.update(Lease, { id: leaseId }, { end_date: endDate, status: 'ended' as any });

      // set unit to vacant if end_date equals provided date
      // (we just set it, so always set unit to vacant)
      await manager.update(Unit, { id: lease.unit_id }, { status: 'vacant' as any });
    });

    return this.findOne(leaseId);
  }
}
