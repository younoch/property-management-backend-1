import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateLeaseDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  portfolio_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  unit_id: number;

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

  @ApiProperty({ enum: ['draft','active','ended','evicted','broken'], required: false })
  @IsEnum(['draft','active','ended','evicted','broken'] as any)
  status: any;
}


