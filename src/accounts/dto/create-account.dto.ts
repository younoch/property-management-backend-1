import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Account name',
    example: 'Premium Account'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Landlord ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  landlord_id: number;

  @ApiProperty({
    description: 'Subscription plan',
    example: 'premium',
    enum: ['basic', 'premium', 'enterprise']
  })
  @IsString()
  @IsNotEmpty()
  subscription_plan: string;

  @ApiProperty({
    description: 'Account status',
    example: 'active',
    enum: ['active', 'inactive', 'suspended']
  })
  @IsString()
  @IsNotEmpty()
  status: string;
} 