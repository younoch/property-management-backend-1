// src/leases/dto/create-lease.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsDateString, 
  IsEnum, 
  IsInt, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  Min, 
  Max 
} from 'class-validator';

export enum LeaseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ENDED = 'ended',
  EVICTED = 'evicted',
  BROKEN = 'broken',
}

export class CreateLeaseDto {
  @ApiProperty({ example: '1', required: false })
  @IsOptional()
  @IsString()
  portfolio_id: string;

  @ApiProperty({ example: '1', required: false })
  @IsOptional()
  @IsString()
  unit_id: string;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  end_date: string;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  rent: number;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  deposit: number;

  @ApiProperty({ example: 1, description: 'Billing day of the month (1-31)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  billing_day?: number;

  @ApiProperty({ example: 3, description: 'Grace period in days', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  grace_days?: number;

  @ApiProperty({ example: 50.0, description: 'Flat late fee amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  late_fee_flat?: number;

  @ApiProperty({ example: 5.0, description: 'Late fee as a percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  late_fee_percent?: number;

  @ApiProperty({ example: 'Notes about this lease', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: LeaseStatus, required: false, default: LeaseStatus.DRAFT })
  @IsOptional()
  @IsEnum(LeaseStatus)
  status?: LeaseStatus;
}
