import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsDateString, IsString } from 'class-validator';
import { AuditAction } from '../audit-log.service';

export class AuditLogQueryDto {

  @ApiPropertyOptional({ description: 'Filter by portfolio ID' })
  @IsNumber()
  @IsOptional()
  portfolioId?: number;

  @ApiPropertyOptional({ description: 'Filter by property ID' })
  @IsNumber()
  @IsOptional()
  propertyId?: number;

  @ApiPropertyOptional({ description: 'Filter by user ID who performed the action' })
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by action type',
    enum: AuditAction,
    enumName: 'AuditAction'
  })
  @IsEnum(AuditAction)
  @IsOptional()
  action?: AuditAction;

  @ApiPropertyOptional({ description: 'Filter by entity type (e.g., "Payment", "Invoice")' })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering (ISO date string)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering (ISO date string)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    default: 1,
    minimum: 1
  })
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Sort order: field to sort by',
    default: 'timestamp'
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({ 
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
