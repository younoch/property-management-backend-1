# Property & Rental Management for Small Landlords - Module Structure

This document outlines the modular TypeORM entities and their relationships in the property management system.

## 🏗️ Module Overview

The system is organized into the following modules:

### 1. Users Module (`src/users/`)
- **Entity**: `User`
- **Purpose**: Manages user identities with different roles
- **Key Features**: Role-based access, profile management, authentication

### 2. Portfolios Module (`src/portfolios/`)
- **Entity**: `Portfolio`
- **Purpose**: Manages rental portfolios (containers) owned by landlords
- **Key Features**: Subscription plans, landlord associations, portfolio-scoped data

### 3. Properties Module (`src/properties/`)
- **Entity**: `Property`
- **Purpose**: Manages property information and location tracking
- **Key Features**: GPS coordinates, property types, unit management

### 4. Reports Module (`src/reports/`)
- **Entity**: `Report`
- **Purpose**: Business reporting and analytics
- **Key Features**: User-generated reports, data analysis

## 📊 Entity Relationships

```
User (1) ──── (Many) Portfolio
  │
  └─── (Many) Report

Portfolio (1) ──── (Many) Property
```

### Relationship Details:
- **User → Portfolio**: One-to-Many (A user can have multiple rental portfolios)
- **User → Report**: One-to-Many (A user can generate multiple reports)
- **Portfolio → Property**: One-to-Many (A portfolio can have multiple properties)

## 🗄️ Database Schema

### User Entity
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password_hash: string;

  @Column()
  role: 'super_admin' | 'landlord' | 'manager' | 'tenant';

  @Column({ nullable: true })
  @IsOptional()
  profile_image_url: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: true })
  requires_onboarding: boolean;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relationships
  @OneToMany(() => Portfolio, (portfolio) => portfolio.landlord)
  owned_portfolios: Portfolio[];

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];
}
```

### Portfolio Entity
```typescript
@Entity()
@Index(['landlord'])
@Index(['status'])
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;
  
  @Column()
  @IsNotEmpty()
  subscription_plan: string;
  
  @Column()
  @IsNotEmpty()
  status: string;
  
  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landlord_id' })
  landlord: User;

  @Column()
  landlord_id: string;

  @Column()
  subscription_plan: string;

  @Column()
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Relationships
  @OneToMany(() => Property, (property) => property.portfolio)
  properties: Property[];
}
```

### Property Entity
```typescript
@Entity()
@Index(['city', 'state'])
@Index(['property_type'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: string;

  @Column()
  name: string;

  @Column()
  address_line1: string;

  @Column({ nullable: true })
  @IsOptional()
  address_line2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip_code: string;

  @Column()
  country: string;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column()
  property_type: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

## 🚀 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/signin` | User login |
| POST | `/auth/signout` | User logout |
| GET | `/auth/whoami` | Get current user info |

### User Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth` | Get all users |
| GET | `/auth/:id` | Get user by ID |
| PATCH | `/auth/:id` | Update user |
| DELETE | `/auth/:id` | Delete user |

### Portfolio Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/portfolios` | Create new portfolio |
| GET | `/portfolios` | Get all portfolios |
| GET | `/portfolios/:id` | Get portfolio by ID |
| GET | `/portfolios/landlord/:landlordId` | Get portfolios by landlord |
| PATCH | `/portfolios/:id` | Update portfolio |
| DELETE | `/portfolios/:id` | Delete portfolio |

### Property Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/portfolios/:portfolioId/properties` | Create new property under a portfolio |
| GET | `/properties` | Get all properties |
| GET | `/properties/:id` | Get property by ID |
| GET | `/portfolios/:portfolioId/properties` | Get properties by portfolio |
| GET | `/properties/location/search` | Search properties by location |
| PATCH | `/properties/:id` | Update property |
| DELETE | `/properties/:id` | Delete property |

## 🔐 Role-Based Access Control

### User Roles
1. **Super Admin**: Full system access
2. **Landlord**: Can manage their own portfolios and properties
3. **Manager**: Can manage properties under assigned portfolios
4. **Tenant**: Limited access to view assigned properties

### Permission Matrix
| Role | Users | Portfolios | Properties | Reports |
|------|-------|------------|------------|---------|
| Super Admin | Full | Full | Full | Full |
| Landlord | Own | Own | Own | Own |
| Manager | View | View | Manage | Create |
| Tenant | View | None | View | None |

## 📝 Data Transfer Objects (DTOs)

### CreateUserDto
```typescript
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  role: 'super_admin' | 'landlord' | 'manager' | 'tenant';
}
```

### CreatePortfolioDto
```typescript
export class CreatePortfolioDto {
  @IsString()
  name: string;

  @IsString()
  landlord_id: string;

  @IsString()
  subscription_plan: string;

  @IsString()
  status: string;
}
```

### CreatePropertyDto
```typescript
export class CreatePropertyDto {
  @IsString()
  portfolio_id: string;

  @IsString()
  name: string;

  @IsString()
  address_line1: string;

  @IsOptional()
  @IsString()
  address_line2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zip_code: string;

  @IsString()
  country: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  property_type: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

## 🧪 Testing

### Module Testing
Each module includes comprehensive tests:
- **Unit Tests**: Service and controller logic
- **Integration Tests**: Database operations
- **E2E Tests**: API endpoint testing

### Test Commands
```bash
# Run all tests
pnpm run test

# Run specific module tests
pnpm run test src/users/
pnpm run test src/portfolios/
pnpm run test src/properties/

# Run with coverage
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e
```

## 🔧 Development Guidelines

### Adding New Modules
1. Create module directory in `src/`
2. Define entity with TypeORM decorators
3. Create DTOs for validation
4. Implement service with business logic
5. Create controller with API endpoints
6. Add module to `app.module.ts`
7. Generate and run migrations
8. Add tests

### Database Migrations
```bash
# Generate migration for schema changes
pnpm run migration:generate -- src/database/migrations/AddNewFeature

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

### Code Style
- Follow NestJS conventions
- Use TypeScript strict mode
- Implement proper error handling
- Add comprehensive logging
- Include API documentation with Swagger decorators

## 📊 Monitoring and Health Checks

### Health Endpoints
- `/health` - Application health status
- `/metrics` - Application metrics (Prometheus format)

### Logging
- Structured logging with Winston
- Request/response logging
- Error tracking and monitoring

## 🚀 Deployment

### Environment Configuration
- Development: `.env.development`
- Production: `.env.production`
- Test: `.env.test`

### Deployment Features
- Automated deployments via GitHub integration
- Built-in health checks and monitoring
- Automatic SSL certificate provisioning
- Zero-downtime deployments
- Custom domain support

For detailed deployment instructions, see the [Deployment Guide](./DEPLOYMENT.md).

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Swagger Documentation](https://swagger.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 