import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeaseChargeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  portfolio_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  lease_id: number;

  @ApiProperty({ example: 'Monthly Rent' })
  @IsString()
  @IsNotEmpty()
  name: string;

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


