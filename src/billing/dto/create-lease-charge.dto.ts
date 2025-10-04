import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeaseChargeDto {
  @ApiProperty({ example: 1 })
  @IsString()
  portfolio_id: string;

  @ApiProperty({ example: 1 })
  @IsString()
  lease_id: string;

  @ApiProperty({ example: 1 })
  @IsString()
  unit_id: string;

  @ApiProperty({ example: 1 })
  @IsString()
  property_id: string;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['monthly','quarterly','yearly'], required: false })
  @IsOptional()
  @IsString()
  cadence?: any;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2026-08-31', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}


