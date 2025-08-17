# Property & Rental Management for Small Landlords - Module Structure

This document outlines the modular TypeORM entities and their relationships in the property management system.

## 🏗️ Module Overview

The system is organized into the following modules:

### 1. Users Module (`src/users/`)
- **Entity**: `User`
- **Purpose**: Manages user accounts with different roles
- **Key Features**: Role-based access, profile management, authentication

### 2. Accounts Module (`src/accounts/`)
- **Entity**: `Account`
- **Purpose**: Manages property management accounts
- **Key Features**: Subscription plans, landlord associations

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
User (1) ──── (Many) Account
  │
  └─── (Many) Report

Account (1) ──── (Many) Property
```

### Relationship Details:
- **User → Account**: One-to-Many (A user can have multiple property management accounts)
- **User → Report**: One-to-Many (A user can generate multiple reports)
- **Account → Property**: One-to-Many (An account can have multiple properties)

## 🗄️ Database Schema

### User Entity
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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
  profile_image_url: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Legacy fields for backward compatibility
  @Column({ nullable: true })
  password: string;

  @Column({ default: true })
  admin: boolean;

  // Relationships
  @OneToMany(() => Account, (account) => account.landlord)
  accounts: Account[];

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];
}
```

### Account Entity
```typescript
@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'landlord_id' })
  landlord: User;

  @Column()
  landlord_id: number;

  @Column()
  subscription_plan: string;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany(() => Property, (property) => property.account)
  properties: Property[];
}
```

### Property Entity
```typescript
@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  account_id: number;

  @Column()
  name: string;

  @Column()
  address_line1: string;

  @Column({ nullable: true })
  address_line2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip_code: string;

  @Column()
  country: string;

  @Column("decimal", { precision: 10, scale: 6 })
  latitude: number;

  @Column("decimal", { precision: 10, scale: 6 })
  longitude: number;

  @Column()
  property_type: string;

  @Column()
  number_of_units: number;

  @Column({ nullable: true, type: "text" })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
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

### Account Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accounts` | Create new account |
| GET | `/accounts` | Get all accounts |
| GET | `/accounts/:id` | Get account by ID |
| GET | `/accounts/landlord/:landlordId` | Get accounts by landlord |
| PATCH | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |

### Property Management Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/properties` | Create new property |
| GET | `/properties` | Get all properties |
| GET | `/properties/:id` | Get property by ID |
| GET | `/properties/account/:accountId` | Get properties by account |
| GET | `/properties/location/search` | Search properties by location |
| PATCH | `/properties/:id` | Update property |
| DELETE | `/properties/:id` | Delete property |

### Reporting Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports` | Get all reports |
| POST | `/reports` | Create new report |
| PATCH | `/reports/:id` | Update report |

## 🔐 Role-Based Access Control

### User Roles
1. **Super Admin**: Full system access
2. **Landlord**: Can manage their own accounts and properties
3. **Manager**: Can manage properties under assigned accounts
4. **Tenant**: Limited access to view assigned properties

### Permission Matrix
| Role | Users | Accounts | Properties | Reports |
|------|-------|----------|------------|---------|
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

### CreateAccountDto
```typescript
export class CreateAccountDto {
  @IsString()
  name: string;

  @IsNumber()
  landlord_id: number;

  @IsString()
  subscription_plan: string;

  @IsString()
  status: string;
}
```

### CreatePropertyDto
```typescript
export class CreatePropertyDto {
  @IsNumber()
  account_id: number;

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

  @IsNumber()
  number_of_units: number;

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
pnpm run test src/accounts/
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

### Docker Support
- Multi-stage builds for production
- Docker Compose for development
- Health checks and monitoring

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Swagger Documentation](https://swagger.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 