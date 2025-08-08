import { 
  IsString, 
  IsNumber, 
  IsNotEmpty, 
  IsOptional, 
  IsDecimal,
  Min,
  MaxLength
} from 'class-validator';

export class CreatePropertyDto {
  @IsNumber()
  @IsNotEmpty()
  account_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address_line1: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_line2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  zip_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @IsDecimal()
  @IsNotEmpty()
  latitude: number;

  @IsDecimal()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  property_type: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  number_of_units: number;

  @IsString()
  @IsOptional()
  description?: string;
} 