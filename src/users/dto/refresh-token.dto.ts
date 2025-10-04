import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token (optional if sent via cookies)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

// Portfolio DTO for owned portfolios
export class PortfolioDto {
  @ApiProperty({ description: 'Portfolio ID', example: '1' })
  id: string;

  @ApiProperty({ description: 'Portfolio name', example: 'Rental Portfolio A' })
  name: string;

  @ApiProperty({ description: 'Portfolio status', example: 'active' })
  status: string;

  @ApiProperty({ description: 'Portfolio creation date', example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;
}

// Notification DTO for user notifications
export class NotificationDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Maintenance Request Update',
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your maintenance request has been updated',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  is_read: boolean;

  @ApiProperty({
    description: 'Notification creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Complete user information including relationships',
    type: 'object',
    properties: {
      id: { type: 'string', example: '1' },
      email: { type: 'string', example: 'user@example.com' },
      name: { type: 'string', example: 'John Doe' },
      phone: { type: 'string', example: '+1234567890' },
      role: { type: 'string', example: 'tenant' },
      profile_image_url: { type: 'string', example: 'https://example.com/profile.jpg', nullable: true },
      is_active: { type: 'boolean', example: true },
      created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
      updated_at: { type: 'string', format: 'date-time', example: '2024-01-20T14:45:00.000Z' },
      owned_portfolios: { 
        type: 'array', 
        items: { $ref: '#/components/schemas/PortfolioDto' },
        example: [
          {
            id: '1',
            name: 'Rental Portfolio A',
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z'
          }
        ]
      },
      notifications: { 
        type: 'array', 
        items: { $ref: '#/components/schemas/NotificationDto' },
        example: [
          {
            id: '1',
            title: 'Maintenance Request Update',
            message: 'Your maintenance request has been updated',
            is_read: false,
            created_at: '2024-01-01T00:00:00.000Z'
          }
        ]
      },
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: string;
    profile_image_url: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    owned_portfolios: PortfolioDto[];
    notifications: NotificationDto[];
  };
}
