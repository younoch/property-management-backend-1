import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Unit } from '../properties/unit.entity';

@Entity()
@Index(['account_id'])
@Index(['unit_id'])
export class Lease {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  account_id: number;

  @ManyToOne(() => Unit, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column()
  unit_id: number;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  rent: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  deposit: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: 'draft' | 'active' | 'ended' | 'evicted' | 'broken';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


