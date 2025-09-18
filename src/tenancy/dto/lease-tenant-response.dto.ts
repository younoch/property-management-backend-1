import { ApiProperty } from '@nestjs/swagger';

export class TenantDto {
  @ApiProperty({ description: 'Tenant ID' })
  id: number;

  @ApiProperty({ description: 'Portfolio ID' })
  portfolio_id: number;

  @ApiProperty({ description: 'First name' })
  first_name: string;

  @ApiProperty({ description: 'Last name' })
  last_name: string;

  @ApiProperty({ description: 'Email address', nullable: true })
  email: string | null;

  @ApiProperty({ description: 'Phone number', nullable: true })
  phone: string | null;

  @ApiProperty({ description: 'Whether the tenant is active', default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiProperty({ description: 'Deletion timestamp', nullable: true })
  deleted_at: Date | null;
}

export class LeaseTenantResponseDto {
  @ApiProperty({ description: 'Lease ID' })
  lease_id: number;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiProperty({ description: 'Deletion timestamp', nullable: true })
  deleted_at: Date | null;

  @ApiProperty({ description: 'Whether this is the primary tenant' })
  is_primary: boolean;

  @ApiProperty({ description: 'Date when tenant moved in', nullable: true })
  moved_in_date: string | null;

  @ApiProperty({ description: 'Date when tenant moved out', nullable: true })
  moved_out_date: string | null;

  @ApiProperty({ description: 'Relationship to primary tenant', nullable: true })
  relationship: string | null;

  @ApiProperty({ 
    description: 'Detailed tenant information',
    type: () => TenantDto,
    required: true
  })
  tenant: TenantDto;
}
