import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '+1234567890', nullable: true })
  phone: string | null;

  @ApiProperty({ enum: ['super_admin', 'landlord', 'manager', 'tenant'] })
  role: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg', nullable: true })
  profile_image_url: string | null;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2025-10-24T17:13:09.403Z' })
  created_at: string;

  @ApiProperty({ example: '2025-10-24T19:38:35.674Z' })
  updated_at: string;

  @ApiProperty({ type: [String], example: [] })
  owned_portfolios: string[];

  @ApiProperty({ type: [String], example: [] })
  notifications: string[];

  @ApiProperty({ example: true })
  requires_onboarding: boolean;

  @ApiProperty({ example: null, nullable: true })
  onboarding_completed_at: string | null;

  @ApiProperty({ example: '2025-10-24T19:41:33.214Z' })
  last_login_at: string;

  @ApiProperty({ example: true })
  is_email_verified: boolean;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class GoogleLoginResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'User signed in successfully' })
  message: string;

  @ApiProperty({ type: UserProfileDto })
  data: UserProfileDto;

  @ApiProperty({ example: '2025-10-24T20:11:45.466Z' })
  timestamp: string;

  @ApiProperty({ example: '/auth/google/login' })
  path: string;
}
