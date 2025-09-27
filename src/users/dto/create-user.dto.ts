import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Whether the user needs to complete onboarding',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  requires_onboarding?: boolean = true;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User role (required)',
    example: 'tenant',
    enum: ['super_admin', 'landlord', 'manager', 'tenant'],
    required: true
  })
  @IsString()
  @IsNotEmpty()
  role: 'super_admin' | 'landlord' | 'manager' | 'tenant';
}
