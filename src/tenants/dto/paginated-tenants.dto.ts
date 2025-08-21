import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Tenant } from '../../tenancy/tenant.entity';

export class PaginatedTenantsResponseDto {
  @ApiProperty({ type: () => [Tenant] })
  @Type(() => Tenant)
  data: Tenant[];

  @ApiProperty({ description: 'Total number of tenants matching the query', example: 42 })
  total: number;

  @ApiProperty({ description: 'Current page number (1-based)', example: 1 })
  page: number;

  @ApiProperty({ description: 'Page size', example: 10 })
  limit: number;
}



