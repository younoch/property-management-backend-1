import { ApiProperty } from '@nestjs/swagger';
import { AuditLog } from '../audit-log.entity';

export class AuditLogResponseDto {
  @ApiProperty({ description: 'Unique identifier for the audit log entry' })
  id: string;

  @ApiProperty({ description: 'Type of the entity that was modified', example: 'Payment' })
  entityType: string;

  @ApiProperty({ description: 'ID of the entity that was modified' })
  entityId: string;

  @ApiProperty({ 
    enum: ['CREATE', 'UPDATE', 'DELETE', 'PAYMENT', 'INVOICE_ISSUE', 'INVOICE_VOID'],
    description: 'Type of action performed'
  })
  action: string;

  @ApiProperty({ 
    description: 'ID of the user who performed the action',
    required: false 
  })
  userId?: string;

  @ApiProperty({ 
    description: 'ID of the portfolio this action relates to',
    required: false 
  })
  portfolioId?: string;

  @ApiProperty({ 
    description: 'Additional metadata about the action',
    type: 'object',
    additionalProperties: true
  })
  metadata?: Record<string, any>;

  @ApiProperty({ 
    description: 'Human-readable description of the action',
    required: false 
  })
  description?: string;

  @ApiProperty({ 
    description: 'Timestamp when the action was performed',
    type: 'string',
    format: 'date-time' 
  })
  timestamp: Date;

  @ApiProperty({ 
    description: 'IP address of the user who performed the action',
    required: false
  })
  ipAddress?: string;

  @ApiProperty({ 
    description: 'User agent of the client that performed the action',
    required: false
  })
  userAgent?: string;

  constructor(auditLog: AuditLog) {
    console.log('Mapping audit log to response:', auditLog);
    
    this.id = auditLog.id;
    this.entityType = auditLog.entity_type;
    this.entityId = auditLog.entity_id;
    this.action = auditLog.action;
    this.userId = auditLog.user_id?.toString();
    this.portfolioId = auditLog.portfolio_id?.toString();
    
    // Handle metadata - ensure it's always an object
    if (typeof auditLog.metadata === 'string') {
      try {
        this.metadata = JSON.parse(auditLog.metadata);
      } catch (e) {
        console.error('Error parsing metadata:', e);
        this.metadata = { raw: auditLog.metadata };
      }
    } else {
      this.metadata = auditLog.metadata || {};
    }
    
    this.description = auditLog.description || null;
    this.timestamp = auditLog.timestamp;
    
    // Map snake_case to camelCase for response
    this.ipAddress = auditLog.ip_address || null;
    this.userAgent = auditLog.user_agent || null;
    
    console.log('Mapped audit log:', this);
  }
}

export class PaginatedAuditLogsResponseDto {
  @ApiProperty({ 
    type: [AuditLogResponseDto],
    description: 'Array of audit log entries'
  })
  data: AuditLogResponseDto[];

  @ApiProperty({ description: 'Total number of items available' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  constructor(data: AuditLogResponseDto[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
