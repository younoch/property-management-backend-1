import { IsString, IsNotEmpty, IsOptional, IsIn, ValidateIf } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Google ID token is required' })
  @ValidateIf(o => !o.accessToken) // Only validate if accessToken is not provided
  token?: string;

  @IsString()
  @IsOptional()
  accessToken?: string; // For frontend Google Sign-In SDK

  @IsString()
  @IsOptional()
  @IsIn(['landlord', 'manager', 'tenant'], { message: 'Role must be one of: landlord, manager, tenant' })
  role?: 'landlord' | 'manager' | 'tenant';
}
