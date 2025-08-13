import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, IsOptional, validateSync, IsNotEmpty } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsBoolean()
  DB_SYNC: boolean;

  @IsBoolean()
  DB_SSL: boolean;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  PORT?: string;

  @IsOptional()
  @IsString()
  ALLOWED_ORIGINS?: string;

  // Cookie and domain configuration (development convenience)
  @IsOptional()
  @IsString()
  FRONTEND_DOMAIN?: string;

  @IsOptional()
  @IsString()
  BACKEND_DOMAIN?: string;

  @IsOptional()
  @IsString()
  COOKIE_DOMAIN?: string;

  @IsOptional()
  @IsBoolean()
  COOKIE_SECURE?: boolean;

  @IsOptional()
  @IsString()
  COOKIE_SAME_SITE?: string; // 'lax' | 'none' | 'strict'

  @IsOptional()
  @IsBoolean()
  COOKIE_HTTP_ONLY?: boolean;

  // Refresh token support
  @IsOptional()
  @IsString()
  JWT_REFRESH_SECRET?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES_IN?: string; // e.g., '7d'

  @IsOptional()
  @IsString()
  TEST_PASSWORD?: string;

  @IsOptional()
  @IsString()
  CSRF_SECRET?: string;

  @IsOptional()
  @IsNumber()
  CSRF_TOKEN_EXPIRY_HOURS?: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map(error => 
      `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`
    ).join('; ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }
  return validatedConfig;
} 