import { ApiProperty } from '@nestjs/swagger';

export class UnitShortDto {
  @ApiProperty({ description: 'Unit ID' })
  id: number;

  @ApiProperty({ description: 'Unit label/name (e.g., "Unit 2B")' })
  label: string;

  @ApiProperty({ 
    description: 'Number of bedrooms',
    required: false,
    nullable: true,
    example: 2
  })
  bedrooms?: number | null;

  @ApiProperty({ 
    description: 'Number of bathrooms',
    required: false,
    nullable: true,
    example: 1.5
  })
  bathrooms?: number | null;

  @ApiProperty({ 
    description: 'Square footage',
    required: false,
    nullable: true,
    example: 850
  })
  sqft?: number | null;

  @ApiProperty({ 
    description: 'Current market rent amount',
    required: false,
    nullable: true,
    example: 1500.00
  })
  market_rent?: number | null;

  @ApiProperty({ 
    description: 'Unit status',
    enum: ['vacant', 'occupied', 'maintenance'],
    example: 'occupied'
  })
  status: string;
}
