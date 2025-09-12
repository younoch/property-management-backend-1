import 'express';

declare global {
  namespace Express {
    interface Request {
      cookies: Record<string, any>;
      signedCookies: Record<string, any>;
    }
  }
}
