import { ApiProperty } from '@nestjs/swagger';

export class PortfolioShortDto {
  @ApiProperty({ description: 'Portfolio ID' })
  id: number;

  @ApiProperty({ description: 'Portfolio name' })
  name: string;

  @ApiProperty({ 
    description: 'Subscription plan',
    example: 'premium',
    required: false
  })
  subscription_plan?: string;

  @ApiProperty({
    description: 'Portfolio status',
    example: 'active',
    enum: ['active', 'suspended', 'cancelled']
  })
  status: string;
}
