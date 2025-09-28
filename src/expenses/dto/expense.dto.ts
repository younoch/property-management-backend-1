import { ApiProperty, OmitType, PickType, PartialType } from '@nestjs/swagger';
import { Expense, ExpenseStatus } from '../expense.entity';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';

// Base DTO that includes all fields from Expense entity except relations
export class ExpenseBaseDto {
  @ApiProperty({ 
    description: 'The unique identifier of the expense',
    example: 1
  })
  id: number;

  @ApiProperty({ 
    description: 'The ID of the property this expense belongs to',
    example: 1
  })
  property_id: number;

  @ApiProperty({ 
    description: 'The amount of the expense',
    example: 250.75,
    minimum: 0.01
  })
  amount: number;

  @ApiProperty({
    description: 'The category of the expense',
    example: 'Maintenance',
    enum: ['Maintenance', 'Utilities', 'Insurance', 'Tax', 'Mortgage', 'Repairs', 'Supplies', 'Other']
  })
  category: string;

  @ApiProperty({
    description: 'The date when the expense was incurred',
    example: '2023-10-15',
    type: 'string',
    format: 'date'
  })
  date_incurred: Date;

  @ApiProperty({
    description: 'The status of the expense payment',
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending',
    example: 'pending'
  })
  status: ExpenseStatus;

  @ApiProperty({
    description: 'Detailed description of the expense',
    example: 'Monthly water bill for October 2023',
    required: false,
    maxLength: 1000
  })
  description?: string;

  @ApiProperty({
    description: 'Vendor or service provider name',
    example: 'ABC Plumbing',
    required: false,
    maxLength: 255
  })
  vendor?: string;

  @ApiProperty({
    description: 'Payment method used',
    example: 'Credit Card',
    required: false,
    enum: ['Credit Card', 'Bank Transfer', 'Check', 'Cash', 'Other']
  })
  payment_method?: string;

  @ApiProperty({
    description: 'URL to the receipt or invoice document',
    example: 'https://example.com/receipts/oct-water-bill.pdf',
    required: false,
    format: 'uri'
  })
  receipt_url?: string;

  @ApiProperty({
    description: 'Tax amount included in the expense',
    example: 15.25,
    default: 0,
    minimum: 0
  })
  tax_amount: number;

  @ApiProperty({
    description: 'Tax rate applied to the expense',
    example: 8.25,
    default: 0,
    minimum: 0,
    maximum: 100
  })
  tax_rate: number;

  @ApiProperty({
    description: 'Additional notes about the expense',
    example: 'Paid via company credit card ending in 1234',
    required: false,
    maxLength: 2000
  })
  notes?: string;

  @ApiProperty({ 
    description: 'Date when the expense was created',
    example: '2023-10-20T08:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  created_at: Date;

  @ApiProperty({ 
    description: 'Date when the expense was last updated',
    example: '2023-10-20T10:15:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  updated_at: Date;

  @ApiProperty({ 
    description: 'Date when the expense was deleted (soft delete)',
    required: false,
    example: '2023-11-01T14:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  deleted_at?: Date;
}

// DTO for creating a new expense
export class CreateExpenseDto {
  /**
   * The ID of the property this expense belongs to
   * @example 1
   */
  @ApiProperty({
    description: 'The ID of the property this expense belongs to',
    example: 1,
    required: true
  })
  @IsInt()
  property_id: number;

  /**
   * The amount of the expense
   * @example 250.75
   */
  @ApiProperty({
    description: 'The amount of the expense',
    example: 250.75,
    required: true,
    minimum: 0.01
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  /**
   * The category of the expense
   * @example 'Maintenance'
   */
  @ApiProperty({
    description: 'The category of the expense',
    example: 'Maintenance',
    enum: ['Maintenance', 'Utilities', 'Insurance', 'Tax', 'Mortgage', 'Repairs', 'Supplies', 'Other'],
    required: true
  })
  @IsString()
  @IsEnum(['Maintenance', 'Utilities', 'Insurance', 'Tax', 'Mortgage', 'Repairs', 'Supplies', 'Other'])
  category: string;

  /**
   * The date when the expense was incurred (YYYY-MM-DD)
   * @example '2023-10-15'
   */
  @ApiProperty({
    description: 'The date when the expense was incurred (YYYY-MM-DD)',
    example: '2023-10-15',
    required: true,
    type: 'string',
    format: 'date'
  })
  @IsDateString()
  date_incurred: string;

  /**
   * The status of the expense payment
   * @example 'pending'
   */
  @ApiProperty({
    description: 'The status of the expense payment',
    example: 'pending',
    enum: ['paid', 'pending', 'overdue'],
    required: false,
    default: 'pending'
  })
  @IsOptional()
  @IsEnum(['paid', 'pending', 'overdue'])
  status?: 'paid' | 'pending' | 'overdue';

  /**
   * Detailed description of the expense
   * @example 'Monthly water bill for October 2023'
   */
  @ApiProperty({
    description: 'Detailed description of the expense',
    example: 'Monthly water bill for October 2023',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  /**
   * Vendor or service provider name
   * @example 'ABC Plumbing'
   */
  @ApiProperty({
    description: 'Vendor or service provider name',
    example: 'ABC Plumbing',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendor?: string;

  /**
   * Payment method used
   * @example 'Credit Card'
   */
  @ApiProperty({
    description: 'Payment method used',
    example: 'Credit Card',
    enum: ['Credit Card', 'Bank Transfer', 'Check', 'Cash', 'Other'],
    required: false
  })
  @IsOptional()
  @IsEnum(['Credit Card', 'Bank Transfer', 'Check', 'Cash', 'Other'])
  payment_method?: string;

  /**
   * URL to the receipt or invoice document
   * @example 'https://example.com/receipts/oct-water-bill.pdf'
   */
  @ApiProperty({
    description: 'URL to the receipt or invoice document',
    example: 'https://example.com/receipts/oct-water-bill.pdf',
    required: false,
    format: 'uri'
  })
  @IsOptional()
  @IsUrl({}, { message: 'Receipt URL must be a valid URL' })
  receipt_url?: string;

  /**
   * Tax amount included in the expense
   * @example 15.25
   */
  @ApiProperty({
    description: 'Tax amount included in the expense',
    example: 15.25,
    required: false,
    default: 0,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Tax amount cannot be negative' })
  tax_amount?: number;

  /**
   * Tax rate applied to the expense
   * @example 8.25
   */
  @ApiProperty({
    description: 'Tax rate applied to the expense',
    example: 8.25,
    required: false,
    default: 0,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Tax rate cannot be negative' })
  @Max(100, { message: 'Tax rate cannot exceed 100%' })
  tax_rate?: number;

  /**
   * Additional notes about the expense
   * @example 'Paid via company credit card ending in 1234'
   */
  @ApiProperty({
    description: 'Additional notes about the expense',
    example: 'Paid via company credit card ending in 1234',
    required: false,
    maxLength: 2000
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

// DTO for updating an existing expense

// DTO for updating an existing expense
export class UpdateExpenseDto extends PartialType(PickType(ExpenseBaseDto, [
  'property_id',
  'amount',
  'category',
  'date_incurred',
  'status',
  'description',
  'vendor',
  'payment_method',
  'receipt_url',
  'tax_amount',
  'tax_rate',
  'notes'
] as const)) {
  @ApiProperty({
    description: 'The amount of the expense',
    example: 275.50,
    minimum: 0.01,
    required: false
  })
  amount?: number;

  @ApiProperty({
    description: 'The category of the expense',
    example: 'Repairs',
    enum: ['Maintenance', 'Utilities', 'Insurance', 'Tax', 'Mortgage', 'Repairs', 'Supplies', 'Other'],
    required: false
  })
  category?: string;

  @ApiProperty({
    description: 'The status of the expense payment',
    enum: ['paid', 'pending', 'overdue'],
    example: 'paid',
    required: false
  })
  status?: ExpenseStatus;
}

// DTO for response (includes all fields)
export class ExpenseDto extends ExpenseBaseDto {}

// DTO for listing expenses (excludes some fields for brevity)
export class ExpenseListDto extends PickType(ExpenseBaseDto, [
  'id',
  'property_id',
  'amount',
  'category',
  'date_incurred',
  'status',
  'vendor',
  'payment_method',
  'tax_amount',
  'tax_rate',
  'created_at'
] as const) {
  @ApiProperty({
    description: 'The unique identifier of the expense',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'The amount of the expense',
    example: 250.75
  })
  amount: number;

  @ApiProperty({
    description: 'The category of the expense',
    example: 'Maintenance'
  })
  category: string;

  @ApiProperty({
    description: 'The date when the expense was incurred',
    example: '2023-10-15',
    type: 'string',
    format: 'date'
  })
  date_incurred: Date;

  @ApiProperty({
    description: 'The status of the expense payment',
    example: 'paid',
    enum: ['paid', 'pending', 'overdue']
  })
  status: ExpenseStatus;
}
