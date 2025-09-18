// src/common/dtos/api-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable success message',
    example: 'Operation completed successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Response data payload'
  })
  data: T;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    example: '/auth/whoami'
  })
  path: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Access token is required. Please sign in to continue.'
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 401
  })
  statusCode: number;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    example: '/auth/whoami'
  })
  path: string;

  @ApiProperty({
    description: 'HTTP method used',
    example: 'GET'
  })
  method: string;

  @ApiProperty({
    description: 'Specific error type for programmatic handling',
    example: 'NO_TOKEN',
    enum: ['NO_TOKEN', 'TOKEN_EXPIRED', 'TOKEN_EXPIRED_REFRESH_AVAILABLE', 'REFRESH_FAILED', 'INVALID_TOKEN', 'USER_NOT_FOUND', 'ACCOUNT_DEACTIVATED', 'INTERNAL_ERROR', 'UNKNOWN_ERROR']
  })
  errorType: string;
}
