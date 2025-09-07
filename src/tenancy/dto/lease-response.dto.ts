import { ApiProperty } from '@nestjs/swagger';
import { LeaseStatus } from '../lease.entity';
import { LeaseTenantResponseDto } from './lease-tenant-response.dto';
import { PortfolioShortDto } from '../../portfolios/dto/portfolio-short.dto';
import { PropertyShortDto } from '../../properties/dto/property-short.dto';
import { UnitShortDto } from '../../properties/dto/unit-short.dto';

export class LeaseResponseDto {
  @ApiProperty({ description: 'Lease ID' })
  id: number;

  @ApiProperty({ description: 'Portfolio ID' })
  portfolio_id: number;

  @ApiProperty({ 
    type: PortfolioShortDto,
    description: 'Portfolio information',
    required: false,
    nullable: true
  })
  portfolio?: PortfolioShortDto | null;

  @ApiProperty({ description: 'Unit ID' })
  unit_id: number;

  @ApiProperty({ 
    type: UnitShortDto,
    description: 'Unit information',
    required: false,
    nullable: true
  })
  unit?: UnitShortDto | null;

  @ApiProperty({ 
    type: PropertyShortDto,
    description: 'Property information',
    required: false,
    nullable: true
  })
  property?: PropertyShortDto | null;

  @ApiProperty({ description: 'Lease start date (YYYY-MM-DD)' })
  start_date: string;

  @ApiProperty({ description: 'Lease end date (YYYY-MM-DD)' })
  end_date: string;

  @ApiProperty({ 
    description: 'Monthly rent amount', 
    type: Number,
    example: 1500.00
  })
  rent: number;

  @ApiProperty({ 
    description: 'Security deposit amount', 
    type: Number,
    example: 1500.00
  })
  deposit: number;

  @ApiProperty({ 
    description: 'Day of month when rent is due (1-31)', 
    required: false, 
    nullable: true,
    example: 1
  })
  billing_day?: number | null;

  @ApiProperty({ 
    description: 'Grace period in days for late payments', 
    required: false, 
    nullable: true,
    example: 3
  })
  grace_days?: number | null;

  @ApiProperty({ 
    description: 'Flat late fee amount', 
    type: Number, 
    required: false, 
    nullable: true,
    example: 50.00
  })
  late_fee_flat?: number | null;

  @ApiProperty({ 
    description: 'Late fee percentage (e.g., 5 for 5%)', 
    type: Number, 
    required: false, 
    nullable: true,
    example: 5.00
  })
  late_fee_percent?: number | null;

  @ApiProperty({ 
    description: 'Additional notes', 
    required: false, 
    nullable: true,
    example: 'First floor unit with balcony'
  })
  notes?: string | null;

  @ApiProperty({ 
    enum: ['draft', 'active', 'ended', 'evicted', 'broken'],
    example: 'active'
  })
  status: LeaseStatus;

  @ApiProperty({ 
    type: String, 
    format: 'date-time',
    example: '2025-01-01T00:00:00.000Z'
  })
  created_at: string | Date;

  @ApiProperty({ 
    type: String, 
    format: 'date-time',
    example: '2025-01-01T00:00:00.000Z'
  })
  updated_at: string | Date;

  @ApiProperty({ 
    type: String, 
    format: 'date-time',
    nullable: true,
    example: null
  })
  deleted_at: string | Date | null;

  @ApiProperty({ 
    type: [LeaseTenantResponseDto],
    description: 'List of tenants associated with this lease'
  })
  lease_tenants: LeaseTenantResponseDto[];
}
