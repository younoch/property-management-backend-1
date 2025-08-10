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
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  });
  
  // Security headers
  (app as any).set('etag', false);
  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });

  // Optional: Set global prefix for all APIs (uncomment if you want /api prefix)
  // app.setGlobalPrefix('api');

  // Swagger documentation (enabled for development and production)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const swaggerPath = process.env.SWAGGER_PATH || 'api';
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
      .addCookieAuth('refresh_token')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    // If using global prefix, change to: SwaggerModule.setup(`${swaggerPath}/docs`, app, document);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        deepLinking: true,
        docExpansion: 'none',
        displayRequestDuration: true,
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        tryItOutEnabled: true,
        defaultModelsExpandDepth: -1,
        requestInterceptor: (req: any) => {
          // Ensure cookies are included in Swagger "Try it out" requests
          req.credentials = 'include';
          return req;
        },
      },
      customSiteTitle: 'Property Management API Docs',
    });
  }

  const port = process.env.PORT || 8000;
  // Bind to all interfaces for containerized environments
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
