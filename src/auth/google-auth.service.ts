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

  async verifyToken(token: string): Promise<GoogleUser> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new BadRequestException('Invalid Google token');
      }

      // Check if email is verified by Google
      if (!payload.email_verified) {
        throw new BadRequestException('Email not verified with Google');
      }

      return {
        email: payload.email!,
        name: payload.name || payload.email!.split('@')[0],
        googleId: payload.sub,
        picture: payload.picture,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid Google token');
    }
  }

  async authenticate(googleToken: string) {
    // Verify the Google token
    const googleUser = await this.verifyToken(googleToken);
    
    // Find or create the user in our database
    const user = await this.usersService.findOrCreateWithGoogle({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.googleId,
      picture: googleUser.picture,
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

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile_image_url: user.profile_image_url,
        is_email_verified: user.isEmailVerified,
        requires_onboarding: user.requires_onboarding,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }
}
