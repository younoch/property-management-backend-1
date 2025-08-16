import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { MaintenanceRequest } from './maintenance-request.entity';

@Entity()
@Index(['account_id'])
export class WorkOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  account_id: number;

  @ManyToOne(() => MaintenanceRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: MaintenanceRequest;

  @Column()
  request_id: number;

  @Column({ type: 'bigint', nullable: true })
  vendor_id: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_for: Date | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  cost_estimate: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  cost_actual: string | null;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: 'scheduled' | 'assigned' | 'in_progress' | 'done' | 'canceled';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


