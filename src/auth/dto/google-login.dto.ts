import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  @IsIn(['landlord', 'manager', 'tenant'])
  role?: 'landlord' | 'manager' | 'tenant';
}
