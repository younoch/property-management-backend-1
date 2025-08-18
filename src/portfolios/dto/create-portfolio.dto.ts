import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({ description: 'Portfolio name', example: 'Rental Portfolio A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Landlord ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  landlord_id: number;

  @ApiProperty({ description: 'Subscription plan', example: 'premium', enum: ['basic', 'premium', 'enterprise'] })
  @IsString()
  @IsNotEmpty()
  subscription_plan: string;

  @ApiPropertyOptional({ description: 'Billing provider customer ID (Stripe/SSLCommerz/etc.)', example: '' })
  @IsString()
  @IsOptional()
  provider_customer_id?: string;

  @ApiPropertyOptional({ description: 'Portfolio status', example: 'active', enum: ['active', 'inactive', 'suspended'], default: 'active' })
  @IsString()
  @IsOptional()
  status?: string;
}


