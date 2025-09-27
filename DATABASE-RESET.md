# Database Reset and Management Guide

This document provides instructions for managing and resetting the database in different environments.

## ⚠️ Important Notes

1. **Backup Your Data**
   - Always create a backup before performing any destructive operations
   - In production, coordinate with your team and schedule a maintenance window

2. **Environment Variables**
   - Ensure your `.env` file is properly configured with the correct database credentials
   - For production, use Render's environment variables

3. **Permissions**
   - You need appropriate database permissions to perform these operations
   - The database user must have permissions to create/drop databases and tables

## Environment-Specific Reset Procedures

## 🔄 Reset Database

### 1. Development Environment

#### Using Migration Commands
```bash
# Drop and recreate database schema
npm run schema:drop

# Run all migrations
npm run migration:run

# Or combined (reset and migrate)
npm run migration:reset
```

#### Using Reset Script
```bash
# Run the TypeScript reset script
npx ts-node scripts/reset-db.ts
```

### 2. Staging/Production Environment

⚠️ **Warning**: Proceed with extreme caution in production environments. Always have a verified backup.

#### Using Render PostgreSQL
1. **Via Render Dashboard:**
   - Go to your PostgreSQL instance in Render Dashboard
   - Use the "Reset Database" option (destroys all data)
   - Re-run migrations after reset

#### Using psql (Advanced)
```bash
# Connect to your Render database
PGPASSWORD=your_render_db_password psql -h your_render_db_host -U your_render_db_user -d your_database

# Drop and recreate (requires additional permissions)
DROP DATABASE your_database;
CREATE DATABASE your_database;
   \q
   
   # Run migrations
   npm run migration:run:prod
   ```

2. **Using pgAdmin or DBeaver:**
   - Connect to your database
   - Right-click on the database → Delete/Drop
   - Create a new database with the same name
   - Run migrations

#### Method 2: Using Backup and Restore
```bash
# Create a backup (before reset)
pg_dump -h your_host -U your_username -d your_database > backup_$(date +%Y%m%d).sql

# Restore from backup (if needed)
psql -h your_host -U your_username -d your_database < backup_file.sql
```

## Data Seeding (Optional)

After resetting, you may want to seed the database with initial data:

```bash
# Run seeders
npm run seed:run

# Or run specific seeder
npm run seed:run -- --seeder=InitialDataSeeder
```

## Post-Reset Verification

1. Verify database structure:
   ```bash
   # Check tables
   psql -h your_host -U your_username -d your_database -c "\dt"
   
   # Check migrations status
   psql -h your_host -U your_username -d your_database -c "SELECT * FROM migrations;"
   ```

2. Run application tests:
   ```bash
   npm test
   ```

3. Perform manual testing of critical paths

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Verify database credentials
   - Check if the database server is running
   - Verify network connectivity

2. **Permission Errors**
   - Ensure the database user has necessary permissions
   - Check if the user has DROP/CREATE privileges

3. **Migration Failures**
   - Check for syntax errors in migration files
   - Verify the order of migrations
   - Check for data dependencies between tables

## Security Considerations

- Never include database credentials in version control
- Use environment variables for sensitive information
- Limit database access to authorized personnel only
- Always backup before performing destructive operations

## Backup and Recovery

### Creating Backups
```bash
# Full database backup
pg_dump -h your_host -U your_username -d your_database -F c -b -v -f backup_$(date +%Y%m%d).backup

# Schema-only backup
pg_dump -h your_host -U your_username -d your_database --schema-only > schema_$(date +%Y%m%d).sql
```

### Restoring from Backup
```bash
# Restore from custom format backup
pg_restore -h your_host -U your_username -d your_database backup_file.backup

# Restore from plain SQL backup
psql -h your_host -U your_username -d your_database < backup_file.sql
```

## Maintenance Schedule

| Task | Frequency | Notes |
|------|-----------|-------|
| Full Backup | Daily | Keep for 7 days |
| Schema Backup | Weekly | Keep for 1 month |
| Database Vacuum | Weekly | During low traffic |
| Performance Analysis | Monthly | Check for slow queries |

## Emergency Contacts

- **Database Administrator**: [Name] - [Email/Phone]
- **Backup Contact**: [Name] - [Email/Phone]
- **Support**: [Support Email/Phone]
   RESET_DB=true
   ```
6. Click "Deploy latest commit"
7. After deployment completes, remove the `RESET_DB` environment variable

### Method 2: Using Manual Script Execution

1. SSH into your Render instance (if enabled)
2. Navigate to your project directory
3. Run the reset script:
   ```bash
   npm run reset-db:prod
   ```
   
### Method 3: Using Render Shell (Alternative)

1. Go to your service in Render dashboard
2. Click on "Shell" in the sidebar
3. Run:
   ```bash
   cd /opt/render/project/src
   npm run reset-db:prod
   ```

## What the Reset Script Does

The reset script performs the following actions:

1. Connects to the production database
2. Drops all user-created tables (excluding system tables)
3. Runs all database migrations
4. Applies any seed data if configured

## Important Notes

⚠️ **Warning**: This operation is destructive and cannot be undone. All data in the database will be lost.

- The reset will only affect the database specified in your environment variables
- Make sure to take a backup before performing a reset if you need to preserve data
- The application may experience brief downtime during the reset process

## Troubleshooting

### Common Issues

1. **Permission denied**
   - Ensure the database user has sufficient privileges
   - Check that the connection string is correct

2. **Connection issues**
   - Verify the database is running and accessible
   - Check network settings and firewall rules
   - Ensure SSL is properly configured

3. **Migration failures**
   - Check the migration files for syntax errors
   - Verify that all required environment variables are set

### Checking Logs

You can view the reset logs in the Render dashboard:
1. Go to your service
2. Click on "Logs"
3. Look for messages containing "reset-db" or error messages

## Best Practices

- Always test database resets in a staging environment first
- Schedule resets during low-traffic periods
- Inform your team before performing a reset
- Consider implementing database backups before major resets

## Need Help?

If you encounter any issues, please contact your system administrator or refer to the [Render documentation](https://render.com/docs).
