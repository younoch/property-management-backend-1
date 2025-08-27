import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Lease } from '../tenancy/lease.entity';
import { PaymentApplication } from './payment-application.entity';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'ach' | 'mobile';

@Entity()
@Index(['portfolio_id'])
@Index(['lease_id'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: number;

  @ManyToOne(() => Lease, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease | null;

  @Column({ nullable: true })
  lease_id: number | null;

  // store as numeric string to match existing codebase conventions
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: '0.00' })
  unapplied_amount: string;

  @Column({ 
    type: 'enum',
    enum: ['cash', 'bank_transfer', 'card', 'ach', 'mobile'],
    default: 'cash' 
  })
  method: PaymentMethod;

  @Column({ type: 'date' })
  at: string;

  @Column({ type: 'varchar', nullable: true })
  reference?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @OneToMany(() => PaymentApplication, (pa) => pa.payment)
  applications: PaymentApplication[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}


