import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWorkOrderDto {
  @ApiProperty({ example: '1' })
  @IsString()
  portfolio_id: string;

  @ApiProperty({ example: '1' })
  @IsString()
  request_id: string;

  @ApiProperty({ example: 123, required: false })
  @IsOptional()
  @IsInt()
  vendor_id?: number;

  @ApiProperty({ example: '2025-09-02T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  scheduled_for?: string;

  @ApiProperty({ example: 200.0, required: false })
  @IsOptional()
  @IsNumber()
  cost_estimate?: number;

  @ApiProperty({ enum: ['scheduled','assigned','in_progress','done','canceled'], required: false })
  @IsOptional()
  @IsEnum(['scheduled','assigned','in_progress','done','canceled'] as any)
  status?: any;
}


