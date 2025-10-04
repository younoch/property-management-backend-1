import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { AuditAction } from './enums/audit-action.enum';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  entity_type: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  entity_id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
    default: AuditAction.UPDATE,
  })
  @Index()
  action: AuditAction;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  user_id?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  portfolio_id?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent?: string;
}
