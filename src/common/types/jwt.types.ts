import { UserRole } from '../../users/enums/user-role.enum';

export interface JwtPayload {
  sub: string; // Always string to match JWT spec
  role?: UserRole;
  type?: 'refresh' | 'access';
  exp?: number;
  iat?: number;
}

export interface AccessTokenPayload extends JwtPayload {
  role: UserRole;
  type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
  role: UserRole;
  type: 'refresh';
}
