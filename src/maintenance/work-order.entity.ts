import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn } from 'typeorm';
import { MaintenanceRequest } from './maintenance-request.entity';

@Entity()
export class WorkOrder {
  @PrimaryGeneratedColumn()
  id: number;

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


