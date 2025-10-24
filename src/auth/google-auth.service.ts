import { Injectable, BadRequestException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

export interface GoogleUser {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  async verifyToken(credentials: { token?: string; accessToken?: string }): Promise<GoogleUser> {
    console.log('[GoogleAuthService] Verifying Google token...');
    try {
      let payload;
      
      if (credentials.token) {
        console.log('[GoogleAuthService] Verifying ID token...');
        const ticket = await this.client.verifyIdToken({
          idToken: credentials.token,
          audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        });
        payload = ticket.getPayload();
        console.log('[GoogleAuthService] ID token verified for email:', payload?.email);
      } else if (credentials.accessToken) {
        console.log('[GoogleAuthService] Verifying access token...');
        const ticket = await this.client.verifyIdToken({
          idToken: credentials.accessToken,
          audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        });
        payload = ticket.getPayload();
        console.log('[GoogleAuthService] Access token verified for email:', payload?.email);
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

    // Return just the user data with tokens - let the controller handle the response structure
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
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
}
