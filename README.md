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

## Description

A comprehensive [Nest](https://github.com/nestjs/nest) framework TypeScript application with PostgreSQL database, built specifically for property management with user roles, account management, and property tracking capabilities.

## 🚀 Features

### 🏠 Property Management
- **🏢 Property Management**: Complete property lifecycle management with location tracking
- **👥 User Management**: Multi-role system (Super Admin, Landlord, Manager, Tenant)
- **💼 Account Management**: Subscription-based account management for landlords
- **📍 Location Services**: GPS coordinates for property mapping
- **📊 Reporting**: Comprehensive property and tenant reporting

### 🔐 Security & Authentication
- **🔐 Authentication & Authorization**: Session-based auth with bcrypt password hashing
- **👤 Role-Based Access**: Different permissions for different user types

### 🛠️ Technical Features
- **📊 API Documentation**: Swagger/OpenAPI documentation
- **📝 Logging**: Structured logging with Winston
- **🏥 Health Checks**: Application and database health monitoring
- **🛡️ Security**: Rate limiting, input validation, CORS support
- **🐳 Docker Support**: Containerized development and deployment
- **📈 Monitoring**: Application metrics and performance monitoring

## 🏗️ Architecture

### Database Schema
- **PostgreSQL**: Production-ready relational database
- **TypeORM**: Object-Relational Mapping with migrations
- **Entities**: User, Account, Property, Report with proper relationships

### Module Structure
- **Users Module**: Authentication and user management
- **Accounts Module**: Property management accounts
- **Properties Module**: Property information and location tracking
- **Reports Module**: Business reporting and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Docker (optional, for containerized setup)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd property-rental-management
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Setup**
```bash
# Generate secure environment configuration
pnpm run generate:env

# OR manually copy and configure environment files
cp env.example .env.development
cp env.production.example .env.production
cp env.test.example .env.test

# ⚠️ IMPORTANT: Update the generated credentials in your database
```

### Database Setup

#### Option 1: Docker (Recommended)
```bash
# Start PostgreSQL container
docker compose up -d

# Run migrations
pnpm run migration:run

# Start the application
pnpm run start:dev
```

## 🔐 Environment Configuration

### Security Best Practices
This application requires several environment variables for secure operation. **Never commit sensitive information to version control.**

### Required Environment Variables

#### Database Configuration
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_USERNAME`: Database username (required)
- `DB_PASSWORD`: Database password (required)
- `DB_NAME`: Database name (required)
- `DB_SYNC`: Enable auto-synchronization (default: false in production)
- `DB_SSL`: Enable SSL connection (default: true in production)

#### Security Configuration
- `COOKIE_KEY`: Secret key for session encryption (required)
- `NODE_ENV`: Environment mode (development/production/test)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

### Quick Environment Setup

#### 1. Generate Secure Environment (Recommended)
```bash
# Generate secure environment with random credentials
pnpm run generate:env
```

This will create a `.env.development` file with:
- Random secure database password
- Random secure cookie key
- Proper configuration for development

#### 2. Manual Setup
```bash
# Copy example files
cp env.example .env.development
cp env.production.example .env.production

# Edit the files with your actual values
# ⚠️ IMPORTANT: Change default passwords and keys
```

### Environment File Structure
```
.env.development    # Development environment
.env.production     # Production environment  
.env.test          # Test environment
```

### Production Security Checklist
- [ ] Use strong, unique passwords for database
- [ ] Generate a cryptographically secure cookie key
- [ ] Enable SSL for database connections
- [ ] Set `DB_SYNC=false` in production
- [ ] Configure proper CORS origins
- [ ] Use environment-specific configuration files

#### Option 2: Local PostgreSQL Installation
1. Install PostgreSQL on your system
2. Create databases:
```sql
CREATE DATABASE property_rental_management_dev;
CREATE DATABASE property_rental_management_test;
```
3. Copy and configure environment files as shown above.

### Running the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run start:prod

# Test mode
pnpm run test

# Reset database (removes all data)
pnpm run db:reset
```

## 🏠 Property Management Features

### User Management
- **Multi-Role System**: Support for Super Admin, Landlord, Manager, and Tenant roles
- **Profile Management**: Complete user profiles with contact information
- **Authentication**: Secure session-based authentication with password hashing

### Account Management
- **Landlord Accounts**: Subscription-based account management
- **Property Groups**: Organize properties under different accounts
- **Status Tracking**: Monitor account status and subscription plans

### Property Management
- **Property Details**: Complete property information including address, type, and units
- **Location Services**: GPS coordinates for property mapping
- **Property Types**: Support for apartments, houses, commercial properties
- **Unit Management**: Track number of units per property

### API Endpoints

#### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - User login
- `GET /auth/whoami` - Get current user info

#### User Management
- `GET /auth/:id` - Get user by ID
- `PATCH /auth/:id` - Update user
- `DELETE /auth/:id` - Delete user

#### Account Management
- `POST /accounts` - Create new account
- `GET /accounts` - List all accounts
- `GET /accounts/:id` - Get account details
- `GET /accounts/landlord/:landlordId` - Get accounts by landlord
- `PATCH /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

#### Property Management
- `POST /properties` - Create new property
- `GET /properties` - List all properties
- `GET /properties/:id` - Get property details
- `GET /properties/account/:accountId` - Get properties by account
- `GET /properties/location/search` - Search properties by location
- `PATCH /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

## 📊 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/health
- **Metrics**: http://localhost:8000/metrics

## 🐳 Docker Deployment

### Quick Start (Local Testing)
```bash
# Start with default configuration
./quick-start.sh
```

### Production Deployment
```bash
# 1. Configure environment
cp env.production.example .env
# Edit .env with your production values

# 2. Deploy
./deploy.sh
```

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Development
```bash
# Start services
docker compose -f docker-compose.dev.yml up -d

# Run migrations
docker compose -f docker-compose.dev.yml exec app pnpm run migration:run

# View logs
docker compose -f docker-compose.dev.yml logs -f app
```

### Production
```bash
# Build and start production services
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec app pnpm run migration:run
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📝 Database Migrations

```bash
# Generate new migration
pnpm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

## 🔧 Development

### Project Structure
```
src/
├── accounts/          # Account management module
├── properties/        # Property management module
├── users/            # User management module
├── reports/          # Reporting module
├── health/           # Health checks
├── monitoring/       # Application monitoring
├── database/         # Database configuration and migrations
└── main.ts          # Application entry point
```

### Environment Variables
- `DB_HOST`: Database host (required)
- `DB_PORT`: Database port (required)
- `DB_USERNAME`: Database username (required)
- `DB_PASSWORD`: Database password (required)
- `DB_NAME`: Database name (required)
- `DB_SYNC`: Auto-sync database schema (default: false for production)
- `DB_SSL`: Enable SSL for database connection (default: true for production)

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

- **Documentation**: Check the `/api` endpoint for detailed API documentation
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join the community discussions for questions and ideas

## 🏆 Acknowledgments

- Built with [NestJS](https://nestjs.com/) framework
- Database powered by [PostgreSQL](https://www.postgresql.org/)
- ORM provided by [TypeORM](https://typeorm.io/)
- API documentation with [Swagger](https://swagger.io/)
