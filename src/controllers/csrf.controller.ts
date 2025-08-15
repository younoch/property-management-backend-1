import { Controller, Get, Post, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { CsrfService } from '../services/csrf.service';

@ApiTags('csrf')
@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiResponse({ status: 200, description: 'CSRF token generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiSecurity('access_token')
  @Get('/token')
  @UseGuards(AuthGuard)
  async getCsrfToken(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).currentUser?.id;
    
    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'User not authenticated'
      });
    }

    // Generate new CSRF token
    const csrfToken = this.csrfService.generateUserToken(userId);
    const expiry = this.csrfService.getTokenExpiry();
    
    // Set CSRF token as HttpOnly cookie
    res.cookie('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: expiry,
      path: '/',
    });
    
    // Return token in response body and headers
    res.setHeader('X-CSRF-Token', csrfToken);
    
    return res.status(HttpStatus.OK).json({
      message: 'CSRF token generated successfully',
      expiresAt: expiry.toISOString(),
      // Don't return the actual token in response body for security
    });
  }

  @ApiOperation({ summary: 'Refresh CSRF token' })
  @ApiResponse({ status: 200, description: 'CSRF token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiSecurity('access_token')
  @Post('/refresh')
  @UseGuards(AuthGuard)
  async refreshCsrfToken(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).currentUser?.id;
    
    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'User not authenticated'
      });
    }

    // Generate new CSRF token
    const csrfToken = this.csrfService.generateUserToken(userId);
    const expiry = this.csrfService.getTokenExpiry();
    
    // Clear old token and set new one
    res.clearCookie('csrf_token', { path: '/' });
    res.cookie('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: expiry,
      path: '/',
    });
    
    // Return new token in headers
    res.setHeader('X-CSRF-Token', csrfToken);
    
    return res.status(HttpStatus.OK).json({
      message: 'CSRF token refreshed successfully',
      expiresAt: expiry.toISOString(),
    });
  }

  @ApiOperation({ summary: 'Validate CSRF token' })
  @ApiResponse({ status: 200, description: 'CSRF token is valid' })
  @ApiResponse({ status: 400, description: 'CSRF token invalid or missing' })
  @Post('/validate')
  async validateCsrfToken(@Req() req: Request, @Res() res: Response) {
    const csrfToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
    const storedToken = req.cookies?.csrf_token || req.signedCookies?.csrf_token;
    
    if (!csrfToken || !storedToken) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'CSRF token missing',
        valid: false
      });
    }
    
    const isValid = this.csrfService.validateToken(csrfToken as string, storedToken);
    
    if (!isValid) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'CSRF token invalid',
        valid: false
      });
    }
    
    return res.status(HttpStatus.OK).json({
      message: 'CSRF token is valid',
      valid: true
    });
  }
}
