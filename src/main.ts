import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  
  // CORS configuration for production
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
  
  console.log('CORS Debug - ALLOWED_ORIGINS env var:', process.env.ALLOWED_ORIGINS);
  console.log('CORS Debug - Parsed allowedOrigins array:', allowedOrigins);
  
  // Enhanced CORS configuration for JWT cookies
  app.enableCors({
    origin: (origin, callback) => {
      console.log('CORS Debug - Request origin:', origin);
      console.log('CORS Debug - Allowed origins:', allowedOrigins);
      console.log('CORS Debug - NODE_ENV:', process.env.NODE_ENV);
      
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        console.log('CORS Debug - No origin, allowing request');
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log('CORS Debug - Origin allowed:', origin);
        return callback(null, true);
      }
      
      // For development, allow localhost variations
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        console.log('CORS Debug - Localhost allowed in dev:', origin);
        return callback(null, true);
      }
      
      console.log('CORS Debug - Origin rejected:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Cookie',
      'Accept',
      'Origin',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['Set-Cookie', 'Access-Control-Allow-Credentials', 'X-CSRF-Token'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Security headers
  (app as any).set('etag', false);
  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    
    // Additional security headers for cookies
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    
    next();
  });

  // Optional: Set global prefix for all APIs (uncomment if you want /api prefix)
  // app.setGlobalPrefix('api');

  // Swagger documentation (enabled for development and production)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Property & Rental Management for Small Landlords API')
      .setDescription('Comprehensive property management system for small landlords with user authentication, property management, and rental operations')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('accounts', 'Account management endpoints')
      .addTag('properties', 'Property management endpoints')
      .addTag('notifications', 'Notification management endpoints')
      .addTag('reports', 'Reporting endpoints')
      .addCookieAuth('access_token')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    // If using global prefix, change to: SwaggerModule.setup('api/docs', app, document);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT || 8000;
  // Bind to all interfaces for containerized environments
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log(`CORS Credentials: enabled`);
  console.log(`Cookie Security: ${process.env.NODE_ENV === 'production' ? 'Secure + SameSite=None' : 'SameSite=Lax (dev)'}`);
}
bootstrap();
