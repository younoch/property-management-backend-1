import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  credential: string; // Google ID token

  @IsString()
  @IsOptional()
  role?: 'landlord' | 'manager' | 'tenant';
}

export class GoogleUserDto {
  @IsString()
  @IsNotEmpty()
  sub: string; // Google ID

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsBoolean()
  @IsOptional()
  email_verified?: boolean;
}
