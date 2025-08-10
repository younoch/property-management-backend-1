import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Tokens refreshed successfully'
  })
  message: string;
}
