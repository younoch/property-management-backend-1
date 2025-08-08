import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  landlord_id: number;

  @IsString()
  @IsNotEmpty()
  subscription_plan: string;

  @IsString()
  @IsNotEmpty()
  status: string;
} 