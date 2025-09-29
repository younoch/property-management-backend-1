// src/tenancy/lease-tenant.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, Index } from 'typeorm';
import { Lease } from '../leases/lease.entity';
import { Tenant } from '../tenants/tenant.entity';

@Entity()
@Index(['lease_id', 'is_primary'], { unique: true, where: 'is_primary = true' })
export class LeaseTenant {
  @PrimaryColumn()
  lease_id: number;

  @PrimaryColumn()
  tenant_id: number;

  @ManyToOne(() => Lease, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease;

  @ManyToOne(() => Tenant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @Column({ type: 'date', nullable: true })
  moved_in_date: string | null;

  @Column({ type: 'date', nullable: true })
  moved_out_date: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  relationship: string | null; // e.g., 'co-tenant', 'guarantor', 'occupant'
}


