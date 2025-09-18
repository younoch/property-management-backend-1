import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Property } from '../property.entity';

export class PaginatedPropertiesResponseDto {
  @ApiProperty({ type: () => [Property] })
  @Type(() => Property)
  data: Property[];

  @ApiProperty({ description: 'Total number of properties matching the query', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page number (1-based)', example: 1 })
  page: number;

  @ApiProperty({ description: 'Page size', example: 10 })
  limit: number;
}



