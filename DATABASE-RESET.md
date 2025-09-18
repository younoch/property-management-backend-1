# Database Reset Guide

This document provides instructions for resetting the production database on Render.

## Prerequisites

- Access to the Render dashboard
- Admin privileges for the project
- Database credentials (stored in Render environment variables)

## How to Reset the Database

### Method 1: Using Render Dashboard (Recommended)

1. Go to your Render dashboard (https://dashboard.render.com/)
2. Navigate to your web service
3. Click on the "Manual Deploy" button
4. Select "Deploy latest commit"
5. In the environment variables section, add or update:
   ```
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
