import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Lease } from '../tenancy/lease.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity()
@Index(['account_id'])
@Index(['lease_id'])
@Index(['due_date'])
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  account_id: number;

  @ManyToOne(() => Lease, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease | null;

  @Column({ nullable: true })
  lease_id: number | null;

  @Column({ type: 'date' })
  issue_date: string;

  @Column({ type: 'date' })
  due_date: string;

  @Column({ type: 'varchar', default: 'open' })
  status: 'draft' | 'open' | 'partially_paid' | 'paid' | 'void';

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  tax: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  balance: string;

  @OneToMany(() => InvoiceItem, (item) => item.invoice)
  items: InvoiceItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


