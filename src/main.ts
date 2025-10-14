import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditLogService } from './common/audit-log.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('x-powered-by');
  app.use(cookieParser());

  // 🔎 Debug DB config on startup
  console.log('🔎 Database Config (from ENV):');
  console.log('   DB_HOST:', process.env.DB_HOST);
  console.log('   DB_PORT:', process.env.DB_PORT);
  console.log('   DB_NAME:', process.env.DB_NAME);
  console.log('   DB_USERNAME:', process.env.DB_USERNAME);
  console.log('   DB_SSL:', process.env.DB_SSL);
  
  // CORS configuration for production
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS
        .split(',')
        .map((o) => o.trim())
        .filter((o) => !!o)
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
  
  // Enhanced CORS configuration for JWT cookies
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      
      // For development, allow localhost variations
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
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

  // Remove noisy request debug middleware for production readiness

  // Optional: Set global prefix for all APIs (uncomment if you want /api prefix)
  // app.setGlobalPrefix('api');

  // Swagger documentation (enabled for development and production)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Property & Rental Management for Small Landlords API')
      .setDescription('Comprehensive property management system for small landlords with user authentication, property management, and rental operations')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .addTag('auth', 'Authentication endpoints')
      .addTag('portfolios', 'Portfolio management endpoints')
      .addTag('properties', 'Property management endpoints (global)')
      .addTag('portfolio-properties', 'Portfolio-specific property management')
      .addTag('units', 'Unit management endpoints')
      .addTag('tenants', 'Tenant management endpoints')
      .addTag('leases', 'Lease management endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('expenses', 'Expense management endpoints')
      .addTag('billing', 'Billing and invoicing endpoints')
      .addTag('maintenance', 'Maintenance requests and work orders endpoints')
      .addTag('documents', 'Document management endpoints')
      .addTag('notifications', 'Notification management endpoints')
      .addTag('feedback', 'User feedback endpoints')
      .addTag('dashboard', 'Dashboard statistics and analytics endpoints')
      .addCookieAuth('access_token')
      .addApiKey({ type: 'apiKey', name: 'X-CSRF-Token', in: 'header' }, 'X-CSRF-Token')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    // Custom Swagger UI configuration to collapse models by default
    const customCss = `
      .opblock-tag {
        margin: 10px 0 !important;
      }
      .opblock-tag, .opblock {
        margin-bottom: 10px !important;
      }
      .model-box {
        margin: 5px 0 !important;
      }
      .model-container {
        margin: 0 0 10px 0 !important;
        padding: 10px;
        border-radius: 4px;
        background: rgba(0,0,0,.05);
      }
      .models {
        margin: 0 !important;
      }
      .model-box {
        background: none !important;
      }
      .model-container .model-box {
        display: none !important;
      }
      .model-container h4 {
        cursor: pointer;
        margin: 0 0 5px 0 !important;
        padding: 5px 0;
        font-size: 16px !important;
      }
      .model-container h4:after {
        content: '▶';
        display: inline-block;
        margin-left: 5px;
        transition: transform 0.3s;
      }
      .model-container h4.model-box-open:after {
        transform: rotate(90deg);
      }
      .model-container .model-box {
        padding-left: 15px !important;
      }
    `;
    
    const customJs = `
      document.addEventListener('DOMContentLoaded', function() {
        // Collapse all models by default
        const models = document.querySelectorAll('.model-container');
        models.forEach(model => {
          const title = model.querySelector('h4');
          const content = model.querySelector('.model-box');
          if (title && content) {
            // Add click handler to toggle models
            title.addEventListener('click', function() {
              this.classList.toggle('model-box-open');
              content.style.display = content.style.display === 'none' ? 'block' : 'none';
            });
            // Initially hide the content
            content.style.display = 'none';
          }
        });
      });
    `;
    
    // If using global prefix, change to: SwaggerModule.setup('api/docs', app, document, options);
    SwaggerModule.setup('api', app, document, {
      customCss,
      customJs,
      customSiteTitle: 'Property Management API',
      swaggerOptions: {
        docExpansion: 'none', // Collapse all operations by default
        filter: true, // Enable filtering
        showRequestDuration: true,
        defaultModelsExpandDepth: -1, // Hide models by default
        defaultModelExpandDepth: 1,   // Show only top level of models
        defaultModelRendering: 'model', // Show models as models, not examples
        displayRequestDuration: true,
      }
    });
  }

  // Enable global validation pipe with transform option
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      whitelist: true, // Strip away any properties that don't have any decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted values are provided
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert primitive types (string -> number, etc.)
      },
    })
  );

  const port = process.env.PORT || 8000;
  // Bind to all interfaces for containerized environments
  // Apply global interceptor for audit logging
  const auditLogService = app.get(AuditLogService);
  app.useGlobalInterceptors(new AuditInterceptor(auditLogService));

  // Start the application
  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log(`CORS Credentials: enabled`);
  console.log(`Cookie Security: ${process.env.NODE_ENV === 'production' ? 'Secure + SameSite=None' : 'SameSite=Lax (dev)'}`);
}
bootstrap();
