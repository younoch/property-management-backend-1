import { Expose } from 'class-transformer';

export class UserDataDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  role: string;

  @Expose()
  profile_image_url: string | null;

  @Expose()
  is_active: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  // Note: password_hash and password fields are intentionally excluded for security
}

// For endpoints that return user data directly (like /auth/whoami)
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  role: string;

  @Expose()
  profile_image_url: string | null;

  @Expose()
  is_active: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  // Note: password_hash and password fields are intentionally excluded for security
}

export class UserDto {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  data: UserDataDto;

  @Expose()
  timestamp: string;

  @Expose()
  path: string;
}
