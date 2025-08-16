import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Invoice } from './invoice.entity';

@Entity()
@Index(['account_id'])
@Index(['invoice_id'])
@Index(['received_at'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  account_id: number;

  @ManyToOne(() => Invoice, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice | null;

  @Column({ nullable: true })
  invoice_id: number | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  received_at: Date;

  @Column({ type: 'varchar', nullable: true })
  method: 'cash' | 'bank_transfer' | 'card' | 'ach' | 'mobile' | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @Column({ type: 'varchar', default: 'succeeded' })
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


