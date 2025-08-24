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
import { Portfolio } from '../portfolios/portfolio.entity';
import { Unit } from '../properties/unit.entity';
import { LeaseTenant } from './lease-tenant.entity'

// Keep string union or switch to a TS enum shared with DTO
export type LeaseStatus = 'draft' | 'active' | 'ended' | 'evicted' | 'broken';

// Optional: number transformer if you want JS numbers from numeric columns
// const numericToNumber = {
//   to: (v?: number | null) => v,
//   from: (v?: string | null) => (v != null ? Number(v) : null),
// };

@Entity()
@Index(['portfolio_id'])
@Index(['unit_id'])
@Index(['status'])
export class Lease {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: number;

  @ManyToOne(() => Unit, { onDelete: 'RESTRICT' })
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

  @OneToMany(() => LeaseTenant, lt => lt.lease)
  leaseTenants: LeaseTenant[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
