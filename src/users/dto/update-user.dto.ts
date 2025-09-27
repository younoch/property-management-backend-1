import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1-555-123-4567',
    required: false
  })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'newPassword123',
    required: false
  })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: ['super_admin', 'landlord', 'manager', 'tenant'],
    example: 'tenant',
    required: false
  })
  @IsEnum(['super_admin', 'landlord', 'manager', 'tenant'])
  @IsOptional()
  role: 'super_admin' | 'landlord' | 'manager' | 'tenant';

  @ApiProperty({
    description: 'URL to user profile image',
    example: 'https://example.com/images/profile.jpg',
    required: false
  })
  @IsUrl()
  @IsOptional()
  profile_image_url: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}
