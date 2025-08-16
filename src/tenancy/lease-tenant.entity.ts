import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lease } from './lease.entity';
import { Tenant } from './tenant.entity';

@Entity()
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
}


