import { ApiProperty } from '@nestjs/swagger';

export class LeaseTenantResponseDto {
  @ApiProperty({ description: 'Lease ID' })
  lease_id: number;

  @ApiProperty({ description: 'Tenant ID' })
  tenant_id: number;

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
}
