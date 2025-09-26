import { IsString, IsNumber, IsNotEmpty, IsOptional, IsEmail, IsUrl, IsIn, IsBoolean, IsNumberString, IsArray, ValidateNested, IsISO31661Alpha2 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsValidTimezone } from '../../common/validators/valid-timezone.decorator';

class InvoiceSettingsDto {
  @ApiPropertyOptional({ description: 'Footer text for invoices' })
  @IsString()
  @IsOptional()
  footer_text?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions for invoices' })
  @IsString()
  @IsOptional()
  terms_conditions?: string;

  @ApiPropertyOptional({ description: 'Additional notes for invoices' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether tax is enabled for invoices', default: false })
  @IsBoolean()
  @IsOptional()
  tax_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Tax rate in percentage (e.g., 7.5 for 7.5%)', minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  tax_rate?: number;

  @ApiPropertyOptional({ description: 'Whether prices include tax', default: false })
  @IsBoolean()
  @IsOptional()
  tax_inclusive?: boolean;

  @ApiPropertyOptional({ description: 'Number of days for payment terms', default: 30, minimum: 0 })
  @IsNumber()
  @IsOptional()
  payment_terms_days?: number;

  @ApiPropertyOptional({ description: 'Whether late fees are enabled', default: false })
  @IsBoolean()
  @IsOptional()
  late_fee_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Late fee amount', minimum: 0 })
  @IsNumber()
  @IsOptional()
  late_fee_amount?: number;

  @ApiPropertyOptional({ description: 'Type of late fee', enum: ['fixed', 'percentage'] })
  @IsIn(['fixed', 'percentage'])
  @IsOptional()
  late_fee_type?: 'fixed' | 'percentage';
}

export class CreatePortfolioDto {
  @ApiProperty({ description: 'Portfolio name', example: 'Rental Portfolio A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Landlord ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  landlord_id: number;

  @ApiPropertyOptional({ description: 'Street address', example: '123 Main St' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'City', example: 'New York' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State or province', example: 'NY' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal or ZIP code', example: '10001' })
  @IsString()
  @IsOptional()
  postal_code?: string;

  @ApiPropertyOptional({ description: 'Country code (ISO 3166-1 alpha-2)', example: 'US' })
  @IsISO31661Alpha2()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Contact phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Contact email address', example: 'contact@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Website URL', example: 'https://example.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Tax ID or EIN', example: '12-3456789' })
  @IsString()
  @IsOptional()
  tax_id?: string;

  @ApiPropertyOptional({ description: 'Business registration number' })
  @IsString()
  @IsOptional()
  registration_number?: string;

  @ApiPropertyOptional({ description: 'VAT number', example: 'GB123456789' })
  @IsString()
  @IsOptional()
  vat_number?: string;

  @ApiPropertyOptional({ description: 'Default currency code (ISO 4217)', example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ 
    description: 'Subscription plan', 
    example: 'premium', 
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  })
  @IsIn(['free', 'basic', 'premium', 'enterprise'])
  @IsString()
  @IsOptional()
  subscription_plan?: string;

  @ApiPropertyOptional({ description: 'Billing provider customer ID (Stripe/SSLCommerz/etc.)' })
  @IsString()
  @IsOptional()
  provider_customer_id?: string;

  @ApiPropertyOptional({ 
    description: 'Portfolio status', 
    example: 'active', 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  })
  @IsIn(['active', 'inactive', 'suspended'])
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Time zone for the portfolio (e.g., America/New_York, Asia/Dhaka). Must be a valid IANA timezone.', 
    example: 'UTC',
    default: 'UTC' 
  })
  @IsString()
  @IsOptional()
  @IsValidTimezone({
    message: 'Invalid timezone. Must be a valid IANA timezone (e.g., America/New_York, Asia/Dhaka)'
  })
  timezone?: string;

  @ApiPropertyOptional({ description: 'URL to the portfolio logo' })
  @IsUrl()
  @IsOptional()
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Invoice settings' })
  @ValidateNested()
  @Type(() => InvoiceSettingsDto)
  @IsOptional()
  invoice_settings?: InvoiceSettingsDto;
}
