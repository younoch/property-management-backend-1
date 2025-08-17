import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// DTO for Portfolio information
export class PortfolioDto {
  @Expose()
  @ApiProperty({ description: 'Portfolio ID', example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ description: 'Portfolio name', example: 'Rental Portfolio A' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'Portfolio status', example: 'active' })
  status: string;

  @Expose()
  @ApiProperty({ description: 'Portfolio creation date', example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;
}

// DTO for Notification information
export class NotificationDto {
  @Expose()
  @ApiProperty({
    description: 'Notification ID',
    example: 1
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'Notification title',
    example: 'Maintenance Request Update'
  })
  title: string;

  @Expose()
  @ApiProperty({
    description: 'Notification message',
    example: 'Your maintenance request has been updated'
  })
  message: string;

  @Expose()
  @ApiProperty({
    description: 'Whether notification is read',
    example: false
  })
  is_read: boolean;

  @Expose()
  @ApiProperty({
    description: 'Notification creation date',
    example: '2024-01-01T00:00:00.000Z'
  })
  created_at: Date;
}

export class UserDataDto {
  @Expose()
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'User phone number',
    example: '+1-555-123-4567'
  })
  phone: string;

  @Expose()
  @ApiProperty({
    description: 'User role in the system',
    example: 'tenant',
    enum: ['super_admin', 'landlord', 'manager', 'tenant']
  })
  role: string;

  @Expose()
  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/images/profile.jpg',
    nullable: true
  })
  profile_image_url: string | null;

  @Expose()
  @ApiProperty({
    description: 'Whether the user account is active',
    example: true
  })
  is_active: boolean;

  @Expose()
  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  created_at: Date;

  @Expose()
  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-20T14:45:00.000Z'
  })
  updated_at: Date;

  @Expose()
  @ApiProperty({
    description: 'Portfolios owned by the user (if landlord)',
    type: [PortfolioDto],
    example: [
      {
        id: 1,
        name: 'Rental Portfolio A',
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  })
  @Type(() => PortfolioDto)
  owned_portfolios: PortfolioDto[];

  @Expose()
  @ApiProperty({
    description: 'User notifications',
    type: [NotificationDto],
    example: [
      {
        id: 1,
        title: 'Maintenance Request Update',
        message: 'Your maintenance request has been updated',
        is_read: false,
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  })
  @Type(() => NotificationDto)
  notifications: NotificationDto[];

  // Note: password_hash and password fields are intentionally excluded for security
}

// For endpoints that return user data directly (like /auth/whoami)
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'User phone number',
    example: '+1-555-123-4567'
  })
  phone: string;

  @Expose()
  @ApiProperty({
    description: 'User role in the system',
    example: 'tenant',
    enum: ['super_admin', 'landlord', 'manager', 'tenant']
  })
  role: string;

  @Expose()
  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/images/profile.jpg',
    nullable: true
  })
  profile_image_url: string | null;

  @Expose()
  @ApiProperty({
    description: 'Whether the user account is active',
    example: true
  })
  is_active: boolean;

  @Expose()
  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  created_at: Date;

  @Expose()
  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-20T14:45:00.000Z'
  })
  updated_at: Date;

  @Expose()
  @ApiProperty({
    description: 'Portfolios owned by the user (if landlord)',
    type: [PortfolioDto],
    example: [
      {
        id: 1,
        name: 'Rental Portfolio A',
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  })
  @Type(() => PortfolioDto)
  owned_portfolios: PortfolioDto[];

  @Expose()
  @ApiProperty({
    description: 'User notifications',
    type: [NotificationDto],
    example: [
      {
        id: 1,
        title: 'Maintenance Request Update',
        message: 'Your maintenance request has been updated',
        is_read: false,
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  })
  @Type(() => NotificationDto)
  notifications: NotificationDto[];

  // Note: password_hash and password fields are intentionally excluded for security
}

// Comprehensive user response with relationships
export class FullUserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'User phone number',
    example: '+1-555-123-4567'
  })
  phone: string;

  @Expose()
  @ApiProperty({
    description: 'User role in the system',
    example: 'tenant',
    enum: ['super_admin', 'landlord', 'manager', 'tenant']
  })
  role: string;

  @Expose()
  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/images/profile.jpg',
    nullable: true
  })
  profile_image_url: string | null;

  @Expose()
  @ApiProperty({
    description: 'Whether the user account is active',
    example: true
  })
  is_active: boolean;

  @Expose()
  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  created_at: Date;

  @Expose()
  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-20T14:45:00.000Z'
  })
  updated_at: Date;

  @Expose()
  @ApiProperty({
    description: 'Portfolios owned by the user (if landlord)',
    type: [PortfolioDto],
    example: [
      {
        id: 1,
        name: 'Rental Portfolio A',
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  })
  @Type(() => PortfolioDto)
  owned_portfolios: PortfolioDto[];

  @Expose()
  @ApiProperty({
    description: 'User notifications',
    type: [NotificationDto],
    example: [
      {
        id: 1,
        title: 'Maintenance Request Update',
        message: 'Your maintenance request has been updated',
        is_read: false,
        created_at: '2024-01-01T00:00:00.000Z'
      }
    ]
  })
  @Type(() => NotificationDto)
  notifications: NotificationDto[];

  // Note: password_hash and password fields are intentionally excluded for security
}

export class UserDto {
  @Expose()
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @Expose()
  @ApiProperty({
    description: 'Success message',
    example: 'User retrieved successfully'
  })
  message: string;

  @Expose()
  @ApiProperty({
    description: 'User data',
    type: UserDataDto
  })
  data: UserDataDto;

  @Expose()
  @ApiProperty({
    description: 'Timestamp when the response was generated',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @Expose()
  @ApiProperty({
    description: 'API endpoint path',
    example: '/users/1'
  })
  path: string;
}
