# 🏠 Property & Rental Management System

A comprehensive backend application for managing properties, tenants, and rental operations with secure authentication and modern security features.

## 📚 Documentation Hub

### 📋 Table of Contents
- [🚀 Project Overview](#-project-overview)
- [⚙️ System Architecture](#-system-architecture)
- [🚀 Getting Started](#-getting-started)
- [🔧 Configuration](#-configuration)
- [🗄️ Database Management](#-database-management)
- [🚀 Deployment](#-deployment)
- [🔍 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🚀 Project Overview

This project is a backend system for property and rental management, built with NestJS and PostgreSQL. It provides a robust API for managing properties, tenants, leases, and more.

### Key Features
- **User Management**: Multi-role authentication and authorization
- **Property Management**: Comprehensive property and unit tracking
- **Lease Management**: Handle rental agreements and terms
- **Document Management**: Store and manage property-related documents
- **Reporting**: Generate reports on properties, tenants, and financials

### Project Structure
```
property-management-backend/
├── src/
│   ├── common/           # Shared modules and utilities
│   ├── config/           # Configuration files
│   ├── database/         # Database configuration and migrations
│   ├── modules/          # Feature modules
│   └── main.ts           # Application entry point
├── test/                 # Test files
├── .env.example          # Example environment variables
└── *.md                  # Documentation files
```

## ⚙️ System Architecture

### Tech Stack
- **Backend Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with CSRF protection
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker (optional)

### Documentation Files
- [📄 Database Reset Guide](./DATABASE-RESET.md) - Instructions for resetting and managing databases
- [🚀 Deployment Guide](./DEPLOYMENT.md) - Step-by-step deployment instructions
- [🏗️ Project Modules](./PROPERTY_MANAGEMENT_MODULES.md) - Detailed module documentation
- [🔄 Database Migrations](./src/database/migrations/README.md) - Database migration guide

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 8.0.0
- TypeScript >= 4.0.0

## 🚀 Features

### Authentication & Security
- **JWT Authentication**: Secure JWT tokens with HttpOnly, Secure cookies
- **CSRF Protection**: Comprehensive CSRF protection for all state-changing operations
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **CORS Configuration**: Properly configured for cross-origin requests with credentials

### User Management
- **Multi-Role System**: Support for Super Admin, Landlord, Manager, and Tenant roles
- **Profile Management**: Complete user profiles with contact information
- **Secure Sessions**: JWT-based authentication with automatic token management

### Property Management
- **Property Details**: Complete property information including address, type, and units
- **Location Services**: GPS coordinates for property mapping
- **Property Types**: Support for apartments, houses, commercial properties
- **Unit Management**: Track number of units per property

### Portfolio Management
- **Landlord Portfolios**: Subscription-based portfolio management
- **Property Groups**: Organize properties under different portfolios
- **Status Tracking**: Monitor portfolio status and subscription plans

## 🔐 Security Features

### CSRF Protection
The application implements comprehensive CSRF (Cross-Site Request Forgery) protection:

- **Double Submit Cookie Pattern**: CSRF tokens stored in HttpOnly cookies and sent via headers
- **Automatic Token Generation**: Tokens generated after authentication
- **State-Changing Operation Protection**: All POST, PUT, DELETE, PATCH operations require CSRF tokens
- **Timing-Safe Validation**: Prevents timing attacks during token comparison

#### CSRF Endpoints
- `GET /csrf/token` - Generate CSRF token (requires authentication)
- `POST /csrf/refresh` - Refresh CSRF token
- `POST /csrf/validate` - Validate CSRF token

#### Frontend Integration
```javascript
// Include CSRF token in all state-changing requests
fetch('/auth/signout', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'X-CSRF-Token': csrfToken
  }
});
```

### JWT Authentication
- **HttpOnly Cookies**: Prevents XSS attacks
- **Secure Flag**: Enforced in production for HTTPS-only transmission
- **SameSite Policy**: Properly configured for cross-origin requests
- **Automatic Expiry**: Configurable token lifetime

## 🛠️ Installation

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 8.0.0
- TypeScript >= 4.0.0

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd property-management-backend

# Install dependencies
npm install

# Copy .env.example to .env and update values
cp .env.example .env

# Start development server
npm run start:dev
```

## ⚙️ Configuration

### Environment Variables

#### Required
- `JWT_ACCESS_SECRET`: Secret for signing access JWTs
- `CSRF_SECRET`: Secret for CSRF token generation
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `NODE_ENV`: Environment (development/production/test)

#### Optional
- `JWT_ACCESS_EXPIRES_IN`: Access token TTL (default: 15m)
- `CSRF_TOKEN_EXPIRY_HOURS`: CSRF token expiry (default: 24h)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend domains (default: 'http://localhost:3000,http://localhost:3001,http://localhost:5173')
- `DB_SSL`: Enable/disable SSL for database connection (default: false)
- `DB_SYNC`: Auto-sync database schema (default: false in production, true in development)
- `RUN_MIGRATIONS_ON_BOOT`: Run pending migrations on application start (default: true)
- `USE_SQLITE_FOR_TESTS`: Use SQLite for tests (default: false)

### Example Configuration
```bash
# .env
NODE_ENV=development

# JWT Configuration
JWT_ACCESS_SECRET=your-secure-jwt-secret
JWT_ACCESS_EXPIRES_IN=15m

# CSRF Configuration
CSRF_SECRET=your-secure-csrf-secret
CSRF_TOKEN_EXPIRY_HOURS=24

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_secure_password
DB_NAME=property_management
DB_SSL=false
DB_SYNC=true

# Application Settings
PORT=3000
RUN_MIGRATIONS_ON_BOOT=true

# Test Configuration (when NODE_ENV=test)
USE_SQLITE_FOR_TESTS=false
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application in production mode |
| `npm run start:dev` | Start in development mode with watch mode |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint the codebase |
| `npm run format` | Format code using Prettier |
| `npm run migration:generate` | Generate a new migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert the last migration |
| `npm run migration:run:prod` | Run migrations in production |

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test Configuration
- Test files use `.spec.ts` suffix for unit tests
- E2E tests use `.e2e-spec.ts` suffix
- Test utilities and fixtures are in the `test/` directory

## 🔍 API Documentation

### Interactive Documentation
Run the application and visit:
- Swagger UI: `http://localhost:3000/api` (development)
- JSON Schema: `http://localhost:3000/api-json`

### Authentication
All protected routes require a valid JWT token in the `Authorization` header.

### Rate Limiting
- API is rate limited to 100 requests per minute per IP address
- Authentication endpoints have stricter rate limits

## 🗄️ Database Management

### Migrations
See the [Database Migrations Guide](./src/database/migrations/README.md) for detailed instructions on managing database schema changes.

### Resetting the Database
For development and testing, you can reset the database using the [Database Reset Guide](./DATABASE-RESET.md).

## 🚀 Deployment

### Production Deployment
Refer to the [Deployment Guide](./DEPLOYMENT.md) for detailed instructions on deploying to production environments.

### Environment Variables
Required environment variables are documented in the [Configuration Guide](#-configuration) section.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow the [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- Use ESLint and Prettier for consistent code formatting
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Jest Documentation](https://jestjs.io/)
- [Docker Documentation](https://docs.docker.com/)

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout (requires CSRF token)
- `GET /auth/whoami` - Get current user info

### CSRF Protection Endpoints
- `GET /csrf/token` - Generate CSRF token
- `POST /csrf/refresh` - Refresh CSRF token
- `POST /csrf/validate` - Validate CSRF token

### User Management Endpoints
- `GET /auth` - Get all users
- `GET /auth/:id` - Get user by ID
- `PATCH /auth/:id` - Update user (requires CSRF token)
- `DELETE /auth/:id` - Delete user (requires CSRF token)

### Feedback Endpoints
- `POST /feedback` - Submit feedback (supports both authenticated and unauthenticated users)
  - **Body**: 
    ```json
    {
      "message": "Your feedback message",
      "user_email": "user@example.com",
      "page_url": "http://example.com/page",
      "user_id": 1 // Optional, for authenticated users
    }
    ```
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Thank you for your feedback!",
      "data": {
        "id": 1,
        "message": "Your feedback message",
        "pageUrl": "http://example.com/page",
        "isReviewed": false,
        "createdAt": "2023-01-01T12:00:00.000Z",
        "userId": 1,
        "userEmail": "user@example.com"
      },
      "timestamp": "2023-01-01T12:00:00.000Z",
      "path": "/feedback"
    }
    ```

- `GET /feedback` - Get all feedback (Admin/Manager only)
  - **Query Params**:
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
    - `reviewed`: Filter by reviewed status (true/false)
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Feedback retrieved successfully",
      "data": [
        {
          "id": 1,
          "message": "Feedback message",
          "pageUrl": "http://example.com/page",
          "isReviewed": false,
          "createdAt": "2023-01-01T12:00:00.000Z",
          "userId": 1,
          "userEmail": "user@example.com"
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 10
      },
      "timestamp": "2023-01-01T12:00:00.000Z",
      "path": "/feedback"
    }
    ```

- `PATCH /feedback/:id/review` - Mark feedback as reviewed (Admin/Manager only)
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Feedback marked as reviewed",
      "data": {
        "id": 1,
        "isReviewed": true,
        "message": "Feedback message",
        "createdAt": "2023-01-01T12:00:00.000Z"
      },
      "timestamp": "2023-01-01T12:00:00.000Z",
      "path": "/feedback/1/review"
    }
    ```

## 🔒 Security Best Practices

### Frontend Implementation
1. **Always include CSRF tokens** in state-changing requests
2. **Handle token refresh** automatically
3. **Store tokens securely** (don't expose in localStorage)
4. **Implement retry logic** for expired tokens

### Production Deployment
1. **Use HTTPS** - Required for Secure cookies
2. **Strong secrets** - Generate cryptographically secure secrets
3. **Environment isolation** - Separate dev/staging/production configs
4. **Regular updates** - Keep dependencies updated

## 🧪 Testing

### Run Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# CSRF tests
pnpm test:e2e --testNamePattern="CSRF Protection"

# CORS tests
pnpm test:e2e --testNamePattern="CORS Configuration"
```

## 📖 Documentation

- [CSRF Implementation Guide](./CSRF_IMPLEMENTATION.md) - Complete CSRF documentation
- [CORS Setup Guide](./CORS_SETUP.md) - CORS configuration and troubleshooting
- [API Documentation](./PROPERTY_MANAGEMENT_MODULES.md) - Detailed API reference

## 🚀 Deployment

### Docker
```bash
# Build and run with Docker Compose
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-Specific Configs
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Test environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./docs/)
- Review [troubleshooting guides](./docs/troubleshooting.md)
- Open an [issue](../../issues) on GitHub

## 🔄 Changelog

### v1.0.0
- Initial release with JWT authentication
- CSRF protection implementation
- Comprehensive CORS configuration
- Multi-role user management system
- Property and portfolio management features
