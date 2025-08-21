import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Portfolio } from '../portfolio.entity';

export class PaginatedPortfoliosResponseDto {
  @ApiProperty({ type: () => [Portfolio] })
  @Type(() => Portfolio)
  data: Portfolio[];

  @ApiProperty({ description: 'Total number of portfolios matching the query', example: 25 })
  total: number;

  @ApiProperty({ description: 'Current page number (1-based)', example: 1 })
  page: number;

  @ApiProperty({ description: 'Page size', example: 10 })
  limit: number;
}


