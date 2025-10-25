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
    private readonly httpService: HttpService
  ) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    
    if (!this.clientId || !clientSecret) {
      this.logger.error('Google OAuth client ID or secret is not configured');
      throw new Error('Google OAuth is not properly configured');
    }
    
    this.client = new OAuth2Client({
      clientId: this.clientId,
      clientSecret: clientSecret,
    });
    
    this.logger.log(`Google OAuth initialized with client ID: ${this.clientId.substring(0, 10)}...`);
  }

  async verifyToken(credentials: { token?: string; accessToken?: string }): Promise<GoogleUser> {
    this.logger.debug('Verifying Google token...');
    
    if (!credentials.token && !credentials.accessToken) {
      this.logger.error('No token or accessToken provided');
      throw new BadRequestException('Either token or accessToken is required');
    }
    
    try {
      if (credentials.token) {
        return await this.verifyIdToken(credentials.token);
      } else if (credentials.accessToken) {
        return await this.verifyAccessToken(credentials.accessToken);
      }
    } catch (error) {
      this.logger.error('Token verification failed', error.stack);
      throw new BadRequestException(error.message || 'Invalid Google token');
    }
  }
  
  private async verifyIdToken(token: string): Promise<GoogleUser> {
    this.logger.debug('Verifying Google ID token...');
    
    try {
      // Verify the ID token using Google's API
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.clientId,
      });
      
      const payload = ticket.getPayload();
      
      if (!payload) {
        this.logger.error('No payload returned from Google token verification');
        throw new Error('No payload returned from Google token verification');
      }
      
      this.logger.debug(`Token verified for email: ${payload.email}`);
      
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
      
      return {
        email: payload.email!,
        name: payload.name || payload.email!.split('@')[0],
        googleId: payload.sub,
        picture: payload.picture
      };
    } catch (error) {
      this.logger.error('Error verifying ID token', error.stack);
      throw new Error(`Invalid Google ID token: ${error.message}`);
    }
  }
  
  private async verifyAccessToken(accessToken: string): Promise<GoogleUser> {
    this.logger.debug('Verifying Google access token...');
    
    try {
      // Use the access token to get user info
      const response = await this.httpService.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }).toPromise();
      
      if (!response.data || !response.data.email) {
        this.logger.error('Invalid user info response from Google');
        throw new Error('Failed to fetch user info from Google');
      }
      
      this.logger.debug(`Successfully verified access token for email: ${response.data.email}`);
      
      return {
        email: response.data.email,
        name: response.data.name || response.data.email.split('@')[0],
        googleId: response.data.sub,
        picture: response.data.picture
      };
    } catch (error) {
      this.logger.error('Error verifying access token', error.stack);
      throw new Error(`Invalid Google access token: ${error.message}`);
    }
  }

  async authenticate(credentials: { token?: string; accessToken?: string; role?: string }): Promise<any> {
    this.logger.debug('Starting Google authentication...');
    
    try {
      // Verify the Google token
      const googleUser = await this.verifyToken({
        token: credentials.token,
        accessToken: credentials.accessToken
      });
      
      this.logger.debug(`Finding or creating user with Google data:`, {
        email: googleUser.email,
        googleId: googleUser.googleId
      });
      
      // Find or create the user in your database
      let user = await this.usersService.findByEmail(googleUser.email);
      
      if (!user) {
        // Create a new user if they don't exist
        user = await this.usersService.createUser({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          role: credentials.role || 'user',
          isEmailVerified: true
        });
        this.logger.debug(`Created new user: ${user.id}`);
      } else {
        // Update existing user if needed
        if (!user.googleId) {
          user = await this.usersService.updateUser(user.id, {
            googleId: googleUser.googleId,
            isEmailVerified: true
          });
          this.logger.debug(`Updated user with Google ID: ${user.id}`);
          // Map the user info to match our expected payload structure
          payload = {
            ...userInfo,
            email: userInfo.email,
            name: userInfo.name || userInfo.email.split('@')[0],
            sub: userInfo.sub,
            email_verified: userInfo.email_verified ?? true, // Default to true if not provided
            picture: userInfo.picture
          };
          
          console.log('[GoogleAuthService] Access token verified for email:', payload?.email);
        } catch (error) {
          console.error('[GoogleAuthService] Error verifying access token:', error);
          throw new BadRequestException('Failed to verify Google access token');
        }
      } else {
        console.error('[GoogleAuthService] No token or accessToken provided');
        throw new BadRequestException('Either token or accessToken is required');
      }
      
      if (!payload) {
        console.error('[GoogleAuthService] Invalid Google token - no payload');
        throw new BadRequestException('Invalid Google token');
      }

      // Check if email is verified by Google
      if (!payload.email_verified) {
        console.error('[GoogleAuthService] Email not verified with Google:', payload.email);
        throw new BadRequestException('Email not verified with Google');
      }

      const userData = {
        email: payload.email!,
        name: payload.name || payload.email!.split('@')[0],
        googleId: payload.sub,
        picture: payload.picture,
      };
      
      console.log('[GoogleAuthService] Token verified successfully:', {
        email: userData.email,
        googleId: userData.googleId
      });
      
      return userData;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid Google token');
    }
  }

  async authenticate(loginDto: { token?: string; accessToken?: string; role?: string }) {
    console.log('[GoogleAuthService] Starting authentication...');
    
    // Verify the Google token
    const googleUser = await this.verifyToken({
      token: loginDto.token,
      accessToken: loginDto.accessToken
    });
    
    console.log('[GoogleAuthService] Finding or creating user with Google data:', {
      email: googleUser.email,
      googleId: googleUser.googleId
    });
    
    // Find or create the user in our database
    const user = await this.usersService.findOrCreateWithGoogle({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.googleId,
      picture: googleUser.picture,
      role: loginDto.role as any
    });

    console.log('[GoogleAuthService] User found/created:', {
      userId: user.id,
      email: user.email,
      googleId: user.googleId,
      role: user.role
    });

    // Update last login time
    user.last_login_at = new Date();
    console.log('[GoogleAuthService] Updating last login time for user:', user.id);
    await this.usersService.update(user.id, { last_login_at: user.last_login_at });

    // Generate JWT tokens
    console.log('[GoogleAuthService] Generating JWT tokens for user:', user.id);
    const accessToken = this.jwtService.sign(
      { 
        sub: user.id, 
        email: user.email, 
        role: user.role 
      },
      { 
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      },
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
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET'),
      },
    );

    // Return user data with tokens
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || null,
      role: user.role,
      profile_image_url: user.profile_image_url || null,
      is_active: user.is_active !== undefined ? user.is_active : true,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
      owned_portfolios: user.owned_portfolios || [],
      notifications: user.notifications || [],
      requires_onboarding: user.requires_onboarding !== undefined ? user.requires_onboarding : true,
      onboarding_completed_at: user.onboarding_completed_at || null,
      last_login_at: user.last_login_at || new Date().toISOString(),
      is_email_verified: true,
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
}
