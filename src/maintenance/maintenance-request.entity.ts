import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Property } from '../properties/property.entity';
import { Unit } from '../units/unit.entity';
import { Tenant } from '../tenants/tenant.entity';

@Entity()
@Index(['status'])
export class MaintenanceRequest extends BaseEntity {
  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column()
  property_id: string;

  @ManyToOne(() => Unit, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit | null;

  @Column({ nullable: true })
  unit_id: string | null;

  @ManyToOne(() => Tenant, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant | null;

  @Column({ nullable: true })
  tenant_id: string | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'emergency';

  @Column({ type: 'varchar', default: 'open' })
  status: 'open' | 'in_progress' | 'completed' | 'canceled';
}
