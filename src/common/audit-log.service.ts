import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PAYMENT = 'PAYMENT',
  INVOICE_ISSUE = 'INVOICE_ISSUE',
  INVOICE_VOID = 'INVOICE_VOID'
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log({
    entityType,
    entityId,
    action,
    userId,
    portfolioId,
    metadata = {},
    description,
  }: {
    entityType: string;
    entityId: number | string;
    action: AuditAction;
    userId?: number;
    portfolioId?: number;
    metadata?: Record<string, any>;
    description?: string;
  }): Promise<void> {
    const log = this.auditLogRepository.create({
      entity_type: entityType,
      entity_id: entityId.toString(),
      action,
      user_id: userId,
      portfolio_id: portfolioId,
      metadata,
      description,
      timestamp: new Date(),
    });

    await this.auditLogRepository.save(log);
  }

  async getLogs(
    entityType: string,
    entityId: number | string,
    limit = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entity_type: entityType, entity_id: entityId.toString() },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
