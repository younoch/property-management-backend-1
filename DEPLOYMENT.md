# Property Management Backend - Production Deployment Guide

## 🚀 Overview

This guide provides step-by-step instructions for deploying the Property Management Backend to production on Render.com.

## Prerequisites

- A [Render.com](https://render.com) account
- A GitHub repository with your code
- A domain name (optional, for custom domain setup)
- PostgreSQL 14+ database (or use Render's PostgreSQL service)

## Step 1: Environment Configuration

1. **Set up environment variables in Render:**
   - Go to your Render Dashboard
   - Navigate to your web service
   - Click on "Environment" tab
   - Add the following required variables:
   - `DB_HOST`: Your database host (e.g., `localhost` or your database server IP)
   - `DB_PORT=5432` (default PostgreSQL port)
   - `DB_USERNAME`: Database username
   - `DB_PASSWORD`: A secure database password
   - `DB_NAME`: Database name
   - `JWT_ACCESS_SECRET`: Strong secret used to sign JWT access tokens
   - `JWT_REFRESH_SECRET`: Strong secret used for refresh tokens
   - `COOKIE_KEY`: Secret key for signing cookies
   - `DEFAULT_LANGUAGE=en` (default language for new users)
   - `ENABLE_SWAGGER=false` (disable in production)

   **Example:**
   ```env
   # Server Configuration
   NODE_ENV=production
   PORT=8000
   ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_secure_password
   DB_NAME=property_management_prod
   DB_SYNC=false
   DB_SSL=false
   
   # Authentication
   JWT_ACCESS_SECRET=your-jwt-access-secret-key-here
   JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-here
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Security
   COOKIE_KEY=my-super-secret-cookie-key-123456789
   COOKIE_SECURE=true
   COOKIE_HTTP_ONLY=true
   
   # Application Settings
   DEFAULT_LANGUAGE=en
   ENABLE_SWAGGER=false
   RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
   RATE_LIMIT_MAX=100  # 100 requests per window per IP
   ```

## Step 2: Deploy to Render.com

### 1. Push to GitHub
Ensure your code is pushed to a GitHub repository that Render can access.

### 2. Create a New Web Service on Render
1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `property-management-api` (or your preferred name)
   - **Region**: Choose the closest to your users
   - **Branch**: `main` (or your production branch)
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm run start:prod:migrate`
   - **Plan**: Free (or select a paid plan for production)

### 3. Configure Environment Variables
In the Render Dashboard, go to your service's "Environment" tab and add these variables:

#### Required Variables
```
NODE_ENV=production
PORT=10000
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your_db_user
   DB_PASSWORD=your_secure_password
   DB_NAME=property_management
   ```

### 4. Database Setup

1. **Create a PostgreSQL Database**
   - In Render Dashboard, create a new PostgreSQL database
   - Note the connection details (host, port, username, password, database name)

2. **Update Environment Variables**
   Update these variables in your Render service settings:
   ```
   DB_HOST=your-render-db-host
   DB_PORT=5432
   DB_USERNAME=your_render_db_user
   DB_PASSWORD=your_secure_password
   DB_NAME=your_database_name
   ```

3. **Run Migrations**
   The `start:prod:migrate` script will automatically run any pending migrations on startup.

### 5. Custom Domain Setup (Optional)

1. In your Render service settings, go to the "Custom Domains" tab
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update your DNS settings to point to the provided Render DNS target
4. Render will automatically provision and renew SSL certificates

## Step 3: Verify Deployment

1. **Check application health:**
   ```bash
   # Basic health check
   curl -i http://localhost:3000/health
   
   # Or if using Nginx
   curl -i http://yourdomain.com/health
   
   # Detailed health check (if implemented)
   curl -i http://localhost:3000/health/detailed
   ```

2. **Test CORS configuration:**
   ```bash
   # Test CORS preflight request
   curl -i -X OPTIONS \
     -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     http://localhost:3000/api/users/me
   ```

3. **Verify API endpoints:**
   ```bash
   # Test public endpoint
   curl -i http://localhost:3000/api/public/status
   
   # Test protected endpoint (requires valid JWT)
   curl -i -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/users/me
   ```

4. **Check application logs:**
   ```bash
   # View logs in Render Dashboard
   # Go to your service in the Render Dashboard
   # Click on the "Logs" tab
   ```

## Step 4: Database Migrations

### Running Migrations in Production

1. **Run pending migrations:**
   ```bash
   # Run all pending migrations
   npm run migration:run
   
   # Or use the production-specific command
   NODE_ENV=production npm run migration:run:prod
   ```

2. **Verify applied migrations:**
   ```bash
   # Connect to the database using psql
   psql -U your_db_user -d your_database_name -c "SELECT * FROM migrations;"
   
   # Or using the application's migration status command (if available)
   npm run migration:show
   ```

3. **Reverting migrations (if needed):**
   ```bash
   # Revert the last applied migration
   npm run migration:revert
   
   # For production
   NODE_ENV=production npm run migration:revert
   ```

### Migration Best Practices
- Always backup your database before running migrations in production
- Test migrations in a staging environment first
- Run migrations during maintenance windows if possible
- Monitor the application after applying migrations
- Have a rollback plan in case of failures
- Consider using a migration tool like `db-migrate` or `knex` for more complex scenarios

## 🔧 Configuration Details

### CORS Configuration
The application is configured to handle CORS requests with the following settings:
- **Origins**: Configurable via `ALLOWED_ORIGINS` environment variable
- **Credentials**: Enabled for session cookies
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With
- **Exposed Headers**: Set-Cookie

### Security Features
- **Swagger Documentation**: Disabled in production
- **Security Headers**: X-Powered-By and Date headers removed
- **Health Checks**: Built-in health monitoring endpoint at `/health`

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Must be `production` | Yes | - |
| `PORT` | Application port | Yes | `10000` (Render default) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | Yes | - |
| `DB_HOST` | Database host from Render | Yes | - |
| `DB_PORT` | Database port | Yes | `5432` |
| `DB_USERNAME` | Database user from Render | Yes | - |
| `DB_PASSWORD` | Database password from Render | Yes | - |
| `DB_NAME` | Database name from Render | Yes | - |
| `JWT_SECRET` | Secret for JWT token signing | Yes | - |
| `COOKIE_KEY` | Session cookie secret | Yes | - |
| `ENABLE_SWAGGER` | Enable API documentation | No | `false` |

> **Note:** For security, all secrets should be managed through Render's environment variables, not committed to source control.

## 🛠️ Management in Render

### View Logs
1. Go to your service in the Render Dashboard
2. Click on the "Logs" tab to view real-time logs
3. Use the search and filter options to find specific log entries

### Restart Service
1. In the Render Dashboard, go to your service
2. Click the "Manual Deploy" button
3. Select "Deploy latest commit" to restart with the latest code

### Environment Variables
1. In the Render Dashboard, go to your service
2. Click on the "Environment" tab
3. Add, edit, or remove environment variables as needed
4. Click "Save Changes" to apply

### Scale Your Service
1. In the Render Dashboard, go to your service
2. Click on the "Manual Deploy" button
3. Adjust the instance count and resources as needed
4. Click "Save Changes" to apply

## 🔍 Troubleshooting

### CORS Issues
1. **Check ALLOWED_ORIGINS**: Ensure your frontend domain is included
2. **Verify Protocol**: Use `https://` for production domains
3. **Check Credentials**: Frontend must include `credentials: 'include'` in requests

### Database Connection Issues
1. **Check Database Status**: 
   - Go to your database service in Render Dashboard
   - Check the "Logs" tab for any connection errors
   - Verify the database is in "Available" status

2. **Verify Environment Variables**:
   - Check that all DB_* variables are correctly set in Render
   - Ensure the database user has proper permissions

### Application Issues
1. **Check Application Logs**:
   - Go to your web service in Render Dashboard
   - Check the "Logs" tab for errors
   - Look for deployment failures or runtime errors

2. **Check Build Logs**:
   - In the Render Dashboard, go to your service
   - Click on the "Deploys" tab
   - Check the build logs for any compilation or dependency issues
2. **Verify Port Binding**: Ensure port 8000 is not in use
3. **Check Health Endpoint**: `curl http://localhost:8000/health`

## 📝 Production Checklist

- [ ] Environment variables configured
- [ ] CORS origins set correctly
- [ ] Database password is secure
- [ ] Cookie secret is strong and unique
- [ ] SSL/HTTPS configured (if using reverse proxy)
- [ ] Firewall rules configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Domain DNS configured
- [ ] SSL certificate installed (if applicable)

## 🔒 Security Recommendations

1. **Use Strong Passwords**: Generate secure passwords for database and cookies
2. **Enable SSL**: Use HTTPS in production
3. **Limit CORS Origins**: Only include necessary domains
4. **Regular Updates**: Keep dependencies updated
5. **Monitor Logs**: Set up log monitoring for security events
6. **Backup Database**: Implement regular database backups
7. **Use Environment Variables**: Store sensitive data in environment variables

## 📞 Support

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Test with a simple curl request to isolate issues 