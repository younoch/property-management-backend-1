import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLeaseChargeDto {
  @ApiProperty({ example: 'Updated Charge Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 1500.0, required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ enum: ['monthly', 'quarterly', 'yearly'], required: false })
  @IsString()
  @IsOptional()
  cadence?: string;

  // Note: We don't include portfolio_id, lease_id, unit_id, or property_id
  // as these should not be updated after creation
}


