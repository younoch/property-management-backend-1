import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID of the portfolio this invoice belongs to'
  })
  @IsInt()
  portfolio_id: number;

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
    example: 1, 
    description: 'ID of the lease this invoice is associated with (if any)' 
  })
  @IsOptional()
  @IsInt()
  lease_id?: number;

  @ApiProperty({ 
    example: '2025-09-01',
    description: 'Date when the invoice was issued (ISO format)'
  })
  @IsDateString()
  issue_date: string;

  @ApiProperty({ 
    example: '2025-09-05',
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
    example: 1500.0,
    description: 'Subtotal amount before tax',
    minimum: 0
  })
  @IsNumber()
  subtotal: number;

  @ApiPropertyOptional({ 
    example: 0, 
    description: 'Tax amount',
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  tax?: number;

  @ApiProperty({ 
    example: 1500.0,
    description: 'Total amount including tax (subtotal + tax)'
  })
  @IsNumber()
  total: number;

  @ApiProperty({ 
    example: 1500.0,
    description: 'Remaining balance to be paid (total - amount_paid)'
  })
  @IsNumber()
  balance: number;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Unique identifier for the line item' },
        type: { 
          type: 'string', 
          enum: ['rent', 'deposit', 'late_fee', 'other'],
          description: 'Type of line item'
        },
        name: { type: 'string', description: 'Display name of the item' },
        description: { type: 'string', description: 'Optional description' },
        qty: { type: 'number', description: 'Quantity', default: 1 },
        unit_price: { type: 'number', description: 'Price per unit' },
        amount: { type: 'number', description: 'Total amount (qty * unit_price)' },
        period_start: { type: 'string', format: 'date', description: 'Start date for time-based items' },
        period_end: { type: 'string', format: 'date', description: 'End date for time-based items' }
      }
    },
    description: 'Line items included in this invoice',
    required: false
  })
  @IsOptional()
  items?: Array<{
    id: string;
    type: string;
    name: string;
    description?: string;
    qty: number;
    unit_price: number;
    amount: number;
    period_start?: string;
    period_end?: string;
  }>;
}


