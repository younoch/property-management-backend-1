// src/tenancy/lease.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Unit } from '../properties/unit.entity';
import { Tenant } from './tenant.entity';
import { LeaseTenant } from './lease-tenant.entity';
import { BadRequestException } from '@nestjs/common';

// Keep string union or switch to a TS enum shared with DTO
export type LeaseStatus = 'draft' | 'active' | 'ended' | 'evicted' | 'broken';

// Optional: number transformer if you want JS numbers from numeric columns
// const numericToNumber = {
//   to: (v?: number | null) => v,
//   from: (v?: string | null) => (v != null ? Number(v) : null),
// };

@Entity()
@Index(['unit_id'])
@Index(['status'])
export class Lease {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Unit, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column()
  unit_id: number;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  // Postgres numeric -> JS string (default). Switch to transformer above if desired.
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  rent: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  deposit: string;

  @Column({ type: 'int', nullable: true }) // 1–31 (validated in DTO)
  billing_day?: number | null;

  @Column({ type: 'int', nullable: true }) // >= 0 (validated in DTO)
  grace_days?: number | null;

  /** NEW: Late fee models (choose one or allow both 0) */
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  late_fee_flat?: string | null; // use transformer to make number

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  late_fee_percent?: string | null; // e.g. 5.00 for 5%

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'varchar', default: 'draft' })
  status: LeaseStatus;

  @OneToMany(() => LeaseTenant, (lt) => lt.lease, { cascade: true, eager: true })
  lease_tenants: LeaseTenant[];

  // Helper method to get all active tenants
  getActiveTenants(): Tenant[] {
    const now = new Date().toISOString().split('T')[0];
    return this.lease_tenants
      .filter(lt => 
        lt.deleted_at === null && 
        (!lt.moved_in_date || lt.moved_in_date <= now) &&
        (!lt.moved_out_date || lt.moved_out_date >= now)
      )
      .map(lt => lt.tenant);
  }

  // Helper method to get primary tenant
  getPrimaryTenant(): Tenant | undefined {
    const primaryLeaseTenant = this.lease_tenants.find(lt => lt.is_primary && lt.deleted_at === null);
    return primaryLeaseTenant?.tenant;
  }

  // Add a tenant to the lease
  async addTenant(tenant: Tenant, isPrimary: boolean = false, relationship?: string): Promise<void> {
    if (this.lease_tenants.some(lt => lt.tenant_id === tenant.id && lt.deleted_at === null)) {
      throw new BadRequestException('Tenant is already associated with this lease');
    }

    if (isPrimary) {
      // Demote any existing primary tenant
      const existingPrimary = this.lease_tenants.find(lt => lt.is_primary && lt.deleted_at === null);
      if (existingPrimary) {
        existingPrimary.is_primary = false;
      }
    }

    const leaseTenant = new LeaseTenant();
    leaseTenant.tenant = tenant;
    leaseTenant.is_primary = isPrimary;
    leaseTenant.relationship = relationship;
    leaseTenant.moved_in_date = new Date().toISOString().split('T')[0];
    
    if (!this.lease_tenants) {
      this.lease_tenants = [];
    }
    this.lease_tenants.push(leaseTenant);
  }

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
