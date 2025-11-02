import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @ApiProperty({ description: 'Unique identifier for the line item' })
  id: string;

  @ApiProperty({ 
    enum: ['rent', 'deposit', 'late_fee', 'other'],
    description: 'Type of line item'
  })
  type: string;

  @ApiProperty({ description: 'Display name of the item' })
  name: string;

  @ApiPropertyOptional({ description: 'Optional description' })
  description?: string;

  @ApiProperty({ 
    description: 'Quantity', 
    default: 1,
    example: 1
  })
  @IsNumber()
  @Min(0)
  qty: number;

  @ApiProperty({
    description: 'Price per unit',
    example: 100.00
  })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({
    description: 'Total amount (qty * unit_price)',
    example: 100.00
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: 'Tax rate as a percentage (e.g., 8.25 for 8.25%)',
    minimum: 0,
    maximum: 100,
    example: 8.25
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_rate?: number;

  @ApiPropertyOptional({ 
    description: 'Start date for time-based items',
    format: 'date',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  period_start?: string;

  @ApiPropertyOptional({ 
    description: 'End date for time-based items',
    format: 'date',
    example: '2025-01-31'
  })
  @IsOptional()
  @IsDateString()
  period_end?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the portfolio this invoice belongs to'
  })
  @IsString()
  @IsNotEmpty()
  portfolio_id: string;

  @ApiProperty({
    example: '2025-09',
    description: 'Billing month in YYYY-MM format',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])$'
  })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'billing_month must be in YYYY-MM format'
  })
  billing_month: string;

  @ApiPropertyOptional({ 
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID of the lease this invoice is associated with (if any)' 
  })
  @IsOptional()
  @IsString()
  lease_id?: string;

  @ApiProperty({ 
    example: '2025-09-01',
    description: 'Date when the invoice was issued (ISO format)'
  })
  @IsDateString()
  issue_date: string;

  @ApiProperty({ 
    example: '2025-09-30',
    description: 'Due date for the invoice payment (ISO format)'
  })
  @IsDateString()
  due_date: string;

  @ApiPropertyOptional({ 
    enum: ['draft', 'open', 'partially_paid', 'paid', 'void'], 
    default: 'draft',
    description: 'Current status of the invoice'
  })
  @IsOptional()
  @IsEnum(['draft', 'open', 'partially_paid', 'paid', 'void'])
  status?: 'draft' | 'open' | 'partially_paid' | 'paid' | 'void';

  @ApiProperty({ 
    example: 1500.00,
    description: 'Subtotal amount before tax',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ 
    example: 123.75, 
    description: 'Tax amount',
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ 
    example: 1623.75,
    description: 'Total amount including tax (subtotal + tax)'
  })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ 
    example: 1623.75,
    description: 'Remaining balance to be paid (total - amount_paid)'
  })
  @IsNumber()
  @Min(0)
  balance: number;

  @ApiPropertyOptional({
    type: [InvoiceItemDto],
    description: 'Line items included in this invoice',
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        type: 'rent',
        name: 'Monthly Rent',
        qty: 1,
        unit_price: 1500.00,
        amount: 1500.00,
        tax_rate: 8.25,
        period_start: '2025-09-01',
        period_end: '2025-09-30'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];
}


