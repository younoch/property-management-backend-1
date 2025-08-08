# Database Migrations

This directory contains database migrations for the PostgreSQL database.

## Migration Commands

To generate a new migration:
```bash
# Generate migration
$ pnpm run migration:generate -- -n MigrationName

# Run migrations
$ pnpm run migration:run

# Revert last migration
$ pnpm run migration:revert
```

## Migration Files

Migration files should be named with the format: `YYYYMMDDHHMMSS-MigrationName.ts`

Example:
- `20231201120000-CreateUsersTable.ts`
- `20231201120001-CreateReportsTable.ts` 