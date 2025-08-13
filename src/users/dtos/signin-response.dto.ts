import { ApiProperty } from '@nestjs/swagger';

export class SigninDataDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  phone: string;

  @ApiProperty({
    description: 'User role in the system',
    example: 'tenant',
    enum: ['super_admin', 'landlord', 'manager', 'tenant'],
  })
  role: string;

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_image_url: string | null;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Legacy admin field for backward compatibility',
    example: false,
  })
  admin: boolean;

  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for token renewal',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Cookie headers to be set by the client',
    example: ['access_token=...; HttpOnly; Secure; SameSite=None', 'refresh_token=...; HttpOnly; Secure; SameSite=None']
  })
  setCookie: string[];

  // Note: password_hash and password fields are intentionally excluded for security
}

export class SigninResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'User signed in successfully'
  })
  message: string;

  @ApiProperty({
    description: 'User authentication data',
    type: SigninDataDto
  })
  data: SigninDataDto;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    example: '/auth/signin'
  })
  path: string;
}
