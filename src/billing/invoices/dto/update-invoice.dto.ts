import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, IsNumber, IsDecimal, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateInvoiceItemDto {
  @IsString()
  id: string;

  @IsString()
  type: string;
  
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  unit_price: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  tax_rate?: number;

  @IsNumber()
  @IsOptional()
  tax_amount?: number;

  @IsString()
  @IsOptional()
  period_start?: string;

  @IsString()
  @IsOptional()
  period_end?: string;
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiPropertyOptional({ 
    description: 'Subtotal amount before tax',
    example: 1000.00
  })
  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @ApiPropertyOptional({ 
    description: 'Total amount including tax',
    example: 1082.50
  })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiPropertyOptional({ 
    description: 'Remaining balance',
    example: 582.50
  })
  @IsNumber()
  @IsOptional()
  balance_due?: number;

  @ApiPropertyOptional({ 
    type: [UpdateInvoiceItemDto],
    description: 'Invoice line items'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceItemDto)
  @IsOptional()
  items?: UpdateInvoiceItemDto[];
  @ApiPropertyOptional({ 
    example: '2025-09',
    description: 'Billing month in YYYY-MM format',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'billing_month must be in YYYY-MM format'
  })
  billing_month?: string;

  @ApiPropertyOptional({ 
    example: 0,
    description: 'Tax amount for the invoice'
  })
  @IsOptional()
  @IsNumber()
  tax_amount?: number;
}


