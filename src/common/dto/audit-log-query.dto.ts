import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsDateString, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction } from '../enums/audit-action.enum';

export class AuditLogQueryDto {

  @ApiPropertyOptional({ 
    description: 'Filter by portfolio ID. Use null to filter for logs with no portfolio.',
    type: String,
    nullable: true,
    example: 1
  })
  @Type(() => String)
  @IsInt()
  @Min(1)
  @IsOptional()
  portfolioId?: string | null;

  @ApiPropertyOptional({ 
    description: 'Filter by property ID',
    type: String
  })
  @Type(() => String)
  @IsInt()
  @Min(1)
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by user ID who performed the action',
    type: Number
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  userId?: string;

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
    type: Number,
    default: 1 
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of items per page', 
    type: Number,
    default: 10 
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({ 
    description: 'Field to sort by',
    enum: ['timestamp', 'action', 'entityType', 'entityId'],
    default: 'timestamp'
  })
  @IsString()
  @IsOptional()
  sortBy?: 'timestamp' | 'action' | 'entityType' | 'entityId' = 'timestamp';

  @ApiPropertyOptional({ 
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
