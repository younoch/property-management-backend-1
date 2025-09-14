import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsArray, 
  ValidateNested, 
  IsDateString, 
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @ApiProperty({ description: 'Name of the item' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the item', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Quantity of the item' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit price of the item' })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ description: 'Tax rate for the item', required: false })
  @IsNumber()
  @IsOptional()
  tax_rate?: number;

  @ApiProperty({ description: 'Total amount for the item' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Start date of the billing period', required: false })
  @IsDateString()
  @IsOptional()
  period_start?: string;

  @ApiPropertyOptional({ description: 'End date of the billing period', required: false })
  @IsDateString()
  @IsOptional()
  period_end?: string;
}

export class SendInvoiceEmailDto {
  @ApiProperty({
    description: 'Email address of the recipient',
    example: 'recipient@example.com',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  recipient_email: string;

  @ApiProperty({
    description: 'Full name of the recipient',
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  recipient_name?: string;

  @ApiProperty({
    description: 'Phone number of the recipient',
    example: '+1234567890',
    required: false
  })
  @IsString()
  @IsOptional()
  recipient_phone?: string;

  @ApiProperty({ description: 'Email subject', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Email message/body', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Property address', required: false })
  @IsString()
  @IsOptional()
  property_address?: string;

  @ApiProperty({ 
    description: 'CC email addresses', 
    type: [String],
    required: false 
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  cc_emails?: string[];

  @ApiProperty({ 
    description: 'BCC email addresses', 
    type: [String],
    required: false 
  })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  bcc_emails?: string[];

  @ApiProperty({ 
    description: 'Reply-to email address', 
    required: false 
  })
  @IsEmail()
  @IsOptional()
  reply_to?: string;

  @ApiProperty({ 
    description: 'Whether to include a watermark on the PDF', 
    required: false,
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  include_watermark?: boolean;

  @ApiProperty({ 
    description: 'Additional notes to include in the email', 
    required: false 
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SendInvoiceEmailResponseDto {
  @ApiProperty({ 
    description: 'Whether the email was sent successfully',
    example: true 
  })
  success: boolean;

  @ApiProperty({ 
    description: 'Message describing the result',
    example: 'Email sent successfully',
    required: false 
  })
  message?: string;

  @ApiProperty({ 
    description: 'Error details if the operation failed',
    example: 'Failed to send email',
    required: false 
  })
  error?: string;

  @ApiProperty({ 
    description: 'Timestamp when the email was sent',
    example: '2025-09-07T22:57:09.000Z',
    required: false 
  })
  timestamp?: Date;
}
