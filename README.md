# Property & Rental Management for Small Landlords

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
  <a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
  <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
  <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

A comprehensive NestJS application for managing properties, tenants, and rental operations with secure authentication and modern security features.

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

### Account Management
- **Landlord Accounts**: Subscription-based account management
- **Property Groups**: Organize properties under different accounts
- **Status Tracking**: Monitor account status and subscription plans

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
- PostgreSQL >= 12.0
- pnpm >= 8.0.0

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd property-management-backend

# Install dependencies
pnpm install

# Generate environment configuration
pnpm run generate:env

# Start development server
pnpm run start:dev
```

## ⚙️ Configuration

### Environment Variables

#### Required
- `JWT_ACCESS_SECRET`: Secret for signing access JWTs
- `CSRF_SECRET`: Secret for CSRF token generation
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`: Database configuration

#### Optional
- `JWT_ACCESS_EXPIRES_IN`: Access token TTL (default: 15m)
- `CSRF_TOKEN_EXPIRY_HOURS`: CSRF token expiry (default: 24h)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend domains
- `NODE_ENV`: Environment (development/production)

### Example Configuration
```bash
# .env.development
NODE_ENV=development
JWT_ACCESS_SECRET=your-dev-secret
CSRF_SECRET=your-csrf-secret
CSRF_TOKEN_EXPIRY_HOURS=24
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=property_management_dev
```

## 📚 API Documentation

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
- Property and account management features
