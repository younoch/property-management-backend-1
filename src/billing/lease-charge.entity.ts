import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Lease } from '../leases/lease.entity';
import { Unit } from '../units/unit.entity';
import { Property } from '../properties/property.entity';

@Entity()
@Index(['lease_id'])
@Index(['unit_id'])
@Index(['property_id'])
export class LeaseCharge {
  @PrimaryGeneratedColumn()
  id: number;

  /** Lease relation */
  @ManyToOne(() => Lease, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease;

  @Column()
  lease_id: number;

  /** Charge name (e.g., Monthly Rent) */
  @Column()
  name: string;

  /** Unit relation */
  @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column()
  unit_id: number;

  /** Property relation */
  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column()
  property_id: number;

  /** Amount with numeric transformer */
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value || '0'),
    },
  })
  amount: number;

  /** Payment cadence */
  @Column({ type: 'varchar', default: 'monthly' })
  cadence: 'monthly' | 'quarterly' | 'yearly';

  /** Charge period */
  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;

  /** Timestamps */
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
