import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ description: 'Portfolio status', example: 'active', enum: ['active', 'inactive', 'suspended'] })
  @IsString()
  @IsNotEmpty()
  status: string;
}


