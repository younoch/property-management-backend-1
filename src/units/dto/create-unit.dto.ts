import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 1 })
  @IsString()
  property_id: string;

  @ApiProperty({ example: 'Unit 2B' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  bedrooms?: number;

  @ApiProperty({ example: 1.5, required: false })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiProperty({ example: 850, required: false })
  @IsOptional()
  @IsInt()
  sqft?: number;

  @ApiProperty({ example: 1200.00, required: false })
  @IsOptional()
  @IsNumber()
  market_rent?: number;
}


