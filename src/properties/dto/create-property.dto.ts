import { 
  IsString, 
  IsNumber, 
  IsNotEmpty, 
  IsOptional, 
  IsDecimal,
  Min,
  MaxLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Account ID that owns this property',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  account_id: number;

  @ApiProperty({
    description: 'Property name',
    example: 'Sunset Apartments',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Primary address line',
    example: '123 Main Street',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address_line1: string;

  @ApiProperty({
    description: 'Secondary address line (optional)',
    example: 'Apt 4B',
    maxLength: 255,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_line2?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'NY',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @ApiProperty({
    description: 'ZIP/Postal code',
    example: '10001',
    maxLength: 20
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  zip_code: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 40.7128
  })
  @IsDecimal()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -74.0060
  })
  @IsDecimal()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'Type of property',
    example: 'apartment',
    enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial']
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  property_type: string;

  @ApiProperty({
    description: 'Number of units in the property',
    example: 24,
    minimum: 1
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  number_of_units: number;

  @ApiProperty({
    description: 'Property description (optional)',
    example: 'Modern apartment complex with amenities',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
} 