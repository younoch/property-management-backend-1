import { 
  Entity, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  Index, 
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn 
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Lease } from '../leases/lease.entity';
import { Tenant } from '../tenants/tenant.entity';

@Entity('lease_tenants')
@Index(['lease_id'])
@Index(['tenant_id'])
export class LeaseTenant extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Lease relation */
  @ManyToOne(() => Lease, (lease) => lease.lease_tenants, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease;

  @Column()
  lease_id: string;

  /** Tenant relation */
  @ManyToOne(() => Tenant, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column()
  tenant_id: string;

  @Column({ default: false })
  is_primary: boolean;

  @Column({ type: 'varchar', nullable: true })
  relationship: string | null;

  @Column({ type: 'date', nullable: true })
  moved_in_date: string | null;

  @Column({ type: 'date', nullable: true })
  moved_out_date: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}
