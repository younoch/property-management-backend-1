import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindPropertiesDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size (max 100)', example: 10, default: 10, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Free-text search across name, address, city, state, zip, country, type, description', example: 'downtown' })
  @IsString()
  @IsOptional()
  search?: string;
}



