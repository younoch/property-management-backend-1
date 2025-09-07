import { ApiProperty } from '@nestjs/swagger';

export class PropertyShortDto {
  @ApiProperty({ description: 'Property ID' })
  id: number;

  @ApiProperty({ description: 'Property name or address line 1' })
  name: string;

  @ApiProperty({ 
    description: 'Property type',
    example: 'apartment',
    enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial']
  })
  type: string;

  @ApiProperty({
    description: 'Property status',
    example: 'active',
    enum: ['active', 'inactive', 'maintenance']
  })
  status: string;
}
