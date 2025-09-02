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
    description: 'Portfolio ID that owns this property (auto-generated from authenticated user)',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsNotEmpty()
  portfolio_id?: number;

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
  @IsOptional()
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
    maxLength: 100,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'NY',
    maxLength: 100,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiProperty({
    description: 'ZIP/Postal code',
    example: '10001',
    maxLength: 20,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zip_code?: string; // stored as postal_code in DB

  @ApiProperty({
    description: 'Country',
    example: 'USA',
    maxLength: 100,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 40.7128,
    required: false
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -74.0060,
    required: false
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Type of property',
    example: 'apartment',
    enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial']
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  property_type: string;

  // number_of_units removed from DB; unit count derived from Unit table

  @ApiProperty({
    description: 'Property description (optional)',
    example: 'Modern apartment complex with amenities',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
} 