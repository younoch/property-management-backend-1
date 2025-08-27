import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PAYMENT = 'PAYMENT',
  INVOICE_ISSUE = 'INVOICE_ISSUE',
  INVOICE_VOID = 'INVOICE_VOID'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'int', nullable: true })
  @Index()
  user_id?: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  portfolio_id?: number;

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
