import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsIn, 
  ValidateIf, 
  IsDefined, 
  Validate
} from 'class-validator';

/**
 * Validates that either token or accessToken is provided
 */
function IsTokenOrAccessToken(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    ValidateIf((obj: any) => !obj.token, {
      ...validationOptions,
      message: 'Either token or accessToken must be provided',
    })(object, propertyName);
  };
}

export class GoogleLoginDto {
  /**
   * Google ID token (JWT) from the client-side Google Sign-In
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Google ID token is required if accessToken is not provided' })
  @ValidateIf(o => !o.accessToken)
  token?: string;

  /**
   * Google OAuth access token (alternative to ID token)
   * Used when the client-side Google Sign-In SDK provides an access token instead of an ID token
   * @example "ya29.a0Ael9sCP..."
   */
  @IsString({ message: 'Access token must be a string' })
  @IsOptional()
  @IsNotEmpty({ message: 'Access token cannot be empty if provided' })
  accessToken?: string;

  /**
   * User role for new account creation
   * @example "landlord"
   */
  @IsString()
  @IsOptional()
  @IsIn(['landlord', 'manager', 'tenant'], { 
    message: 'Role must be one of: landlord, manager, tenant' 
  })
  role?: 'landlord' | 'manager' | 'tenant';

  /**
   * Validates that either token or accessToken is provided
   */
  @IsDefined({
    message: 'Either token or accessToken must be provided',
  })
  @ValidateIf(o => !o.token && !o.accessToken)
  _tokenCheck?: never;
}
