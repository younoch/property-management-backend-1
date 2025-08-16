import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Lease } from '../tenancy/lease.entity';

@Entity()
@Index(['account_id'])
@Index(['lease_id'])
export class LeaseCharge {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  account_id: number;

  @ManyToOne(() => Lease, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease;

  @Column()
  lease_id: number;

  @Column()
  name: string; // e.g., Monthly Rent

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', default: 'monthly' })
  cadence: 'monthly' | 'quarterly' | 'yearly';

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


