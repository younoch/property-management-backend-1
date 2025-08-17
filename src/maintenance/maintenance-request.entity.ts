import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Property } from '../properties/property.entity';
import { Unit } from '../properties/unit.entity';
import { Tenant } from '../tenancy/tenant.entity';

@Entity()
@Index(['portfolio_id'])
@Index(['status'])
export class MaintenanceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: number;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column()
  property_id: number;

  @ManyToOne(() => Unit, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit | null;

  @Column({ nullable: true })
  unit_id: number | null;

  @ManyToOne(() => Tenant, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant | null;

  @Column({ nullable: true })
  tenant_id: number | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'emergency';

  @Column({ type: 'varchar', default: 'open' })
  status: 'open' | 'in_progress' | 'completed' | 'canceled';

  @Column({ type: 'timestamptz', default: () => 'now()' })
  requested_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


