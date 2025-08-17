import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SigninDataDto {
  @Expose()
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  phone: string;

  @Expose()
  @ApiProperty({
    description: 'User role in the system',
    example: 'tenant',
    enum: ['super_admin', 'landlord', 'manager', 'tenant'],
  })
  role: string;

  @Expose()
  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_image_url: string | null;

  @Expose()
  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  is_active: boolean;

  @Expose()
  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @Expose()
  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;

  @Expose()
  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @Expose()
  @ApiProperty({
    description: 'Refresh token for token renewal',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  // Note: password_hash and password fields are intentionally excluded for security
}

export class SigninResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @Expose()
  @ApiProperty({
    description: 'Success message',
    example: 'User signed in successfully'
  })
  message: string;

  @Expose()
  @ApiProperty({
    description: 'User authentication data',
    type: SigninDataDto
  })
  data: SigninDataDto;

  @Expose()
  @ApiProperty({
    description: 'Timestamp when the response was generated',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @Expose()
  @ApiProperty({
    description: 'API endpoint path',
    example: '/auth/signin'
  })
  path: string;
}
