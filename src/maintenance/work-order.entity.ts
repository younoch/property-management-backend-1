import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn, DeleteDateColumn } from 'typeorm';
import { MaintenanceRequest } from './maintenance-request.entity';

@Entity()
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MaintenanceRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: MaintenanceRequest;

  @Column()
  request_id: string;

  @Column({ type: 'varchar', nullable: true })
  vendor_id: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_for: Date | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  cost_estimate: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  cost_actual: string | null;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: 'scheduled' | 'assigned' | 'in_progress' | 'done' | 'canceled';

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date | null;
}


