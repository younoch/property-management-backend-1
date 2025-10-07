import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentLeaseDto {
  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'cash', enum: ['cash','bank','mobile','other'] })
  @IsString()
  method: 'cash' | 'bank' | 'mobile' | 'other';

  @ApiProperty({ example: '2025-08-25', required: false })
  @IsOptional()
  @IsDateString()
  at?: string;

  @ApiProperty({ example: 'TXN-123', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: 'Partial payment', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
