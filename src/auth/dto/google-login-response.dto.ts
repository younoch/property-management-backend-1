import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;
}

export class UserProfileDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'tenant' })
  role: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  profile_image_url?: string;

  @ApiProperty({ example: true })
  is_email_verified: boolean;

  @ApiProperty({ example: true })
  requires_onboarding: boolean;
}

export class GoogleLoginResponseDto {
  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ type: TokensDto })
  tokens: TokensDto;
}
