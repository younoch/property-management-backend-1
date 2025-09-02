import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidTimezone } from '../../common/validators/valid-timezone.decorator';

export class CreatePortfolioDto {
  @ApiProperty({ description: 'Portfolio name', example: 'Rental Portfolio A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Landlord ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  landlord_id: number;

  @ApiPropertyOptional({ description: 'Subscription plan', example: 'premium', enum: ['free', 'basic', 'premium', 'enterprise'] })
  @IsString()
  @IsNotEmpty()
  subscription_plan?: string;

  @ApiPropertyOptional({ description: 'Billing provider customer ID (Stripe/SSLCommerz/etc.)', example: '' })
  @IsString()
  @IsOptional()
  provider_customer_id?: string;

  @ApiPropertyOptional({ description: 'Portfolio status', example: 'active', enum: ['active', 'inactive', 'suspended'], default: 'active' })
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
}
