import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface GoogleUser {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    
    if (!this.clientId || !clientSecret) {
      this.logger.error('Google OAuth client ID or secret is not configured');
      throw new Error('Google OAuth is not properly configured');
    }
    
    this.client = new OAuth2Client({
      clientId: this.clientId,
      clientSecret,
    });
    
    this.logger.log(`Google OAuth initialized with client ID: ${this.clientId.substring(0, 10)}...`);
  }

  async verifyToken(credentials: { token?: string; accessToken?: string }): Promise<GoogleUserInfo> {
    this.logger.debug('Verifying Google token...');
    
    if (!credentials.token && !credentials.accessToken) {
      const error = new Error('Either token (ID token) or accessToken is required');
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
    
    try {
      if (credentials.token) {
        // Verify this is a valid JWT token
        const tokenParts = credentials.token.split('.');
        if (tokenParts.length !== 3) {
          const errorMsg = 'Invalid ID token format. Expected a JWT with 3 parts (header.payload.signature)';
          this.logger.error(errorMsg, {
            tokenLength: credentials.token.length,
            tokenParts: tokenParts.length
          });
          throw new BadRequestException(errorMsg);
        }
        
        return await this.verifyIdToken(credentials.token);
      } 
      
      if (credentials.accessToken) {
        this.logger.debug('Using access token for authentication');
        return await this.verifyAccessToken(credentials.accessToken);
      }
      
      throw new BadRequestException('No valid authentication method provided');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during token verification';
      this.logger.error(`Token verification failed: ${errorMessage}`, 
        error instanceof Error ? error.stack : undefined);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException({
        statusCode: 400,
        message: 'Authentication failed',
        error: 'AUTHENTICATION_FAILED',
        details: errorMessage
      });
    }
  }
  
  private async verifyIdToken(token: string): Promise<GoogleUserInfo> {
    this.logger.debug('Verifying Google ID token...');
    
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.clientId,
      });
      
      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new Error('No payload returned from Google token verification');
      }
      
      // Verify the token's issuer
      const isGoogleIssued = [
        'https://accounts.google.com', 
        'accounts.google.com'
      ].includes(payload.iss || '');
      
      if (!isGoogleIssued) {
        this.logger.error(`Invalid token issuer: ${payload.iss}`);
        throw new Error('Invalid token issuer');
      }
      
      // Check if the token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        this.logger.error(`Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
        throw new Error('Token has expired');
      }
      
      // Check if the token was issued for our client ID
      if (payload.aud !== this.clientId) {
        this.logger.error(`Token audience mismatch: expected ${this.clientId}, got ${payload.aud}`);
        throw new Error('Token audience mismatch');
      }
      
      // Check if email is verified
      if (!payload.email_verified) {
        this.logger.error(`Email not verified: ${payload.email}`);
        throw new Error('Email not verified with Google');
      }
      
      this.logger.debug(`Token verified for email: ${payload.email}`);
      
      return {
        email: payload.email!,
        name: payload.name || payload.email!.split('@')[0],
        sub: payload.sub,
        picture: payload.picture,
        email_verified: payload.email_verified,
        given_name: payload.given_name,
        family_name: payload.family_name,
        locale: payload.locale
      };
    } catch (error) {
      this.logger.error('Error verifying ID token', error instanceof Error ? error.stack : String(error));
      throw new Error(`Invalid Google ID token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private async verifyAccessToken(accessToken: string): Promise<GoogleUserInfo> {
    this.logger.debug('Verifying Google access token...');
    
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to fetch user info: ${errorText}`);
        throw new Error('Failed to fetch user info from Google');
      }
      
      const data = await response.json() as GoogleUserInfo;
      
      if (!data || !data.email) {
        this.logger.error('Invalid user info response from Google');
        throw new Error('Invalid user info response from Google');
      }
      
      this.logger.debug(`Successfully verified access token for email: ${data.email}`);
      
      return {
        email: data.email,
        name: data.name || data.email.split('@')[0],
        sub: data.sub,
        picture: data.picture,
        email_verified: data.email_verified || true,
        given_name: data.given_name,
        family_name: data.family_name,
        locale: data.locale
      };
    } catch (error) {
      this.logger.error('Error verifying access token', error instanceof Error ? error.stack : String(error));
      throw new Error(`Failed to verify access token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async authenticate(credentials: { token?: string; accessToken?: string; role?: string }): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      role: 'super_admin' | 'landlord' | 'manager' | 'tenant';
      isEmailVerified: boolean;
      phone: string | null;
      profile_image_url: string | null;
      is_active: boolean;
      requires_onboarding: boolean;
    };
    accessToken: string;
    refreshToken: string;
  }> {
    if (!credentials.token && !credentials.accessToken) {
      throw new BadRequestException('Either token or accessToken is required');
    }
    this.logger.debug('Starting Google authentication...');
    
    try {
      // Verify the Google token
      const googleUser = await this.verifyToken({
        token: credentials.token,
        accessToken: credentials.accessToken
      });

      this.logger.debug('Finding or creating user with Google data:', {
        email: googleUser.email,
        googleId: googleUser.sub
      });
      
      // Find or create the user in the database
      const user = await this.usersService.findOrCreateWithGoogle({
        email: googleUser.email,
        name: googleUser.name || googleUser.email.split('@')[0],
        googleId: googleUser.sub,
        picture: googleUser.picture,
        role: credentials.role as any
      });

      this.logger.debug('User found/created:', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Update last login time
      user.last_login_at = new Date();
      await this.usersService.update(user.id, { last_login_at: user.last_login_at });

      // Generate JWT tokens
      const accessToken = this.jwtService.sign(
        { 
          sub: user.id, 
          email: user.email, 
          role: user.role 
        },
        { 
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        }
      );

      const refreshToken = this.jwtService.sign(
        { 
          sub: user.id, 
          email: user.email, 
          role: user.role,
          isRefreshToken: true,
        },
        { 
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
          secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 
                 this.configService.get<string>('JWT_ACCESS_SECRET'),
        }
      );

      // Return user data with tokens
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'super_admin' | 'landlord' | 'manager' | 'tenant',
          isEmailVerified: user.isEmailVerified || false,
          phone: user.phone || null,
          profile_image_url: user.profile_image_url || null,
          is_active: user.is_active !== undefined ? user.is_active : true,
          requires_onboarding: user.requires_onboarding !== undefined ? user.requires_onboarding : true
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      this.logger.error('Authentication failed', error instanceof Error ? error.stack : String(error));
      
      // Handle specific error cases
      if (error.message.includes('already exists') || 
          error.message.includes('already registered')) {
        throw new BadRequestException({
          statusCode: 400,
          message: error.message,
          error: 'ACCOUNT_EXISTS',
          existingAccount: true
        });
      }
      
      // For other errors, provide a generic message
      throw new BadRequestException({
        statusCode: 400,
        message: error instanceof Error ? error.message : 'Authentication failed',
        error: 'AUTHENTICATION_FAILED'
      });
    }
  }
}
