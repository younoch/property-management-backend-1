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

```bash
cp .env.example .env
```

### Configuration Files
- `.env` - Environment variables (not versioned)
- `.env.example` - Example environment variables

For production configuration, see the [Deployment Guide](./DEPLOYMENT.md).

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

## ⚙️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application in production mode |
| `npm run start:dev` | Start in development mode with watch mode |
| `npm run start:prod` | Start in production mode (no migrations) |
| `npm run start:prod:migrate` | Start in production mode with migrations |
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
- Test database is automatically created and destroyed during tests

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

### Development
- Run migrations: `npm run migration:run`
- Reset database: `npm run schema:drop && npm run migration:run`

For detailed database operations, see the [Database Reset Guide](./DATABASE-RESET.md).

### Production
In production, the database is managed through Render's PostgreSQL service. See the [Deployment Guide](./DEPLOYMENT.md) for details.

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

### Deploy to Render.com
This application is configured for seamless deployment to [Render.com](https://render.com). For detailed deployment instructions, see the [Deployment Guide](./DEPLOYMENT.md).

Key deployment features:
- Automatic SSL certificate provisioning
- Built-in PostgreSQL database support
- Automatic deployments from Git
- Zero-downtime deployments
- Custom domain support

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
