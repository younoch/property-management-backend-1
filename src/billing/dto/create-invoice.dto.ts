import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  portfolio_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  lease_id?: number;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  issue_date: string;

  @ApiProperty({ example: '2025-09-05' })
  @IsDateString()
  due_date: string;

  @ApiProperty({ enum: ['draft','open','partially_paid','paid','void'], required: false })
  @IsEnum(['draft','open','partially_paid','paid','void'] as any)
  status: any;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  total: number;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  balance: number;
}


