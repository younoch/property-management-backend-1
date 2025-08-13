import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDataDto {
  @ApiProperty({
    description: 'New access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'User information'
  })
  user: {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: string;
    is_active: boolean;
  };
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Tokens refreshed successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Token refresh data',
    type: RefreshTokenDataDto
  })
  data: RefreshTokenDataDto;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    example: '/auth/refresh'
  })
  path: string;
}
