import { ApiProperty } from '@nestjs/swagger';

export class SigninResponseDto {
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
    description: 'User role in the system',
    example: 'tenant',
    enum: ['super_admin', 'landlord', 'manager', 'tenant'],
  })
  role: string;
}
