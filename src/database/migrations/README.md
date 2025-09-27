# Database Migrations

This directory contains database migrations for the PostgreSQL database. Migrations are used to manage database schema changes in a version-controlled manner.

## Migration Commands

### Generate a New Migration
Generate a new migration based on your entity changes:
```bash
# Generate a new migration
$ npm run migration:generate -- src/database/migrations/DescriptiveMigrationName

# Example:
$ npm run migration:generate -- src/database/migrations/AddNewFieldToUser
```

### Run Migrations
Apply pending migrations to the database:
```bash
# Run all pending migrations
$ npm run migration:run

# Run migrations in production
$ npm run migration:run:prod
```

### Revert Migrations
Revert the most recent migration:
```bash
# Revert the last applied migration
$ npm run migration:revert
```

## Best Practices

1. **Naming Convention**: Use descriptive names that explain the change (e.g., `AddEmailVerificationToUser`)
2. **Review**: Always review the generated migration file before running it
3. **Backup**: Take a database backup before running migrations in production
4. **One Change per Migration**: Keep each migration focused on a single schema change
5. **Test**: Test migrations in a development environment before applying to production

## Migration Files

Each migration file contains:
- `up()`: The changes to apply to the database
- `down()`: How to revert those changes
- `name`: A unique identifier for the migration

Migration files should be named with the format: `YYYYMMDDHHMMSS-MigrationName.ts`

Example:
- `20231201120000-CreateUsersTable.ts`
- `20231201120001-CreateReportsTable.ts` 