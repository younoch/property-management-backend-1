import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { MaintenanceRequest } from './maintenance-request.entity';

@Entity()
@Index(['portfolio_id'])
export class WorkOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: number;

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

  @DeleteDateColumn()
  deleted_at: Date | null;
}


