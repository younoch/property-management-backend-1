import {
  IsString,
  IsNumber,
  Min,
  Max,
  IsLongitude,
  IsLatitude,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description: 'Car make/brand',
    example: 'Toyota',
  })
  @IsString()
  make: string;

  @ApiProperty({
    description: 'Car model',
    example: 'Camry',
  })
  @IsString()
  model: string;

  @ApiProperty({
    description: 'Car manufacturing year',
    example: 2020,
    minimum: 1930,
    maximum: 2050,
  })
  @IsNumber()
  @Min(1930)
  @Max(2050)
  year: number;

  @ApiProperty({
    description: 'Car mileage in kilometers',
    example: 50000,
    minimum: 0,
    maximum: 1000000,
  })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -122.4194,
  })
  @IsLongitude()
  lng: number;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 37.7749,
  })
  @IsLatitude()
  lat: number;

  @ApiProperty({
    description: 'Car price in USD',
    example: 25000,
    minimum: 0,
    maximum: 1000000,
  })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price: number;
}
