import { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { AuditAction } from './enums/audit-action.enum';

export class BaseAuditService {
  constructor(
    protected readonly auditLogService: AuditLogService,
    protected readonly request: Request
  ) {}

  protected async logAction(
    entityType: string,
    entityId: number | string,
    action: AuditAction,
    oldValue?: any,
    newValue?: any
  ) {
    try {
      const user = (this.request as any).user;
      await this.auditLogService.log({
        entityType,
        entityId: entityId?.toString(),
        action,
        userId: user?.id,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }
}
