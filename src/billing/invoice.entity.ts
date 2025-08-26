import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Lease } from '../tenancy/lease.entity';

export interface InvoiceItem {
  name: string;
  qty: number;
  unit_price: number;
  amount: number;
}

@Entity()
@Index(['portfolio_id'])
@Index(['lease_id'])
@Index(['due_date'])
export class Invoice {
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

  @Column({ type: 'date' })
  issue_date: string;

  @Column({ type: 'date' })
  due_date: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: 'draft' | 'open' | 'partially_paid' | 'paid' | 'void';

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  tax: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  balance: string;

  @Column({ type: 'jsonb', default: [] })
  items: InvoiceItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
