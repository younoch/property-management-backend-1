# Property Management Backend - Deployment Guide

## 🚀 Production Deployment

This guide will help you deploy the Property Management Backend to production with proper CORS configuration and environment setup.

## Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 14+ database
- PM2 (for process management in production)
- Nginx (recommended for reverse proxy)
- A domain name with DNS configured
- SSL certificate (recommended, e.g., from Let's Encrypt)

## Step 1: Environment Configuration

1. **Copy the production environment template:**
   ```bash
   cp env.production.example .env
   ```

2. **Edit the `.env` file with your production values:**
   ```bash
   nano .env
   ```

   **Required configurations:**
   - `NODE_ENV=production`
   - `PORT=8000` (or your preferred port)
   - `ALLOWED_ORIGINS`: Your frontend domain(s) separated by commas (e.g., `https://yourdomain.com,https://www.yourdomain.com`)
   - `DB_HOST`: Your database host (use `postgres` if using Docker)
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
   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=my-secure-password-123
   DB_NAME=property_rental_management_prod
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

## Step 2: Deploy the Application

### 1. Install Dependencies
```bash
# Install production dependencies
npm ci --only=production

# Build the application
npm run build

# Install PM2 globally (if not already installed)
npm install -g pm2
```

### 2. Configure the Application

1. **Set up environment variables** in `.env` file (created in Step 1)
2. **Update the following settings** in your `.env` file:
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_secure_password
   DB_NAME=property_management
   ```

### 3. Start the Application

#### Option A: Using PM2 (Recommended for Production)
```bash
# Start the application with PM2
pm2 start dist/main.js --name="property-management"

# Save the PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Start PM2 on system boot
pm2 save
```

#### Option B: Direct Node.js Execution
```bash
# Start the application directly
node dist/main.js

# Or using npm
npm run start:prod
```

### 4. Set Up Nginx as Reverse Proxy (Recommended)

1. Install Nginx:
   ```bash
   # For Ubuntu/Debian
   sudo apt update
   sudo apt install nginx
   ```

2. Create a new Nginx configuration file at `/etc/nginx/sites-available/property-management`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/property-management /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl restart nginx
   ```

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
   # View PM2 logs
   pm2 logs property-management --lines 100
   
   # Follow logs in real-time
   pm2 logs property-management --lines 100 --raw
   
   # View Nginx access logs
   sudo tail -f /var/log/nginx/access.log
   
   # View Nginx error logs
   sudo tail -f /var/log/nginx/error.log
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
- **Non-root User**: Application runs as non-root user in Docker
- **Health Checks**: Built-in health monitoring

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Application port | No | `8000` |
| `ALLOWED_ORIGINS` | CORS allowed origins | Yes | - |
| `DB_HOST` | Database host | Yes | - |
| `DB_PORT` | Database port | Yes | `5432` |
| `DB_USERNAME` | Database username | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_NAME` | Database name | Yes | - |
| `DB_SYNC` | Auto-sync database | No | `false` |
| `DB_SSL` | Use SSL for database | No | `false` |
| `COOKIE_KEY` | Session cookie secret | Yes | - |

## 🛠️ Management Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update Application
```bash
# Pull latest changes and rebuild
git pull
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔍 Troubleshooting

### CORS Issues
1. **Check ALLOWED_ORIGINS**: Ensure your frontend domain is included
2. **Verify Protocol**: Use `https://` for production domains
3. **Check Credentials**: Frontend must include `credentials: 'include'` in requests

### Database Connection Issues
1. **Check Database Status**: `docker-compose -f docker-compose.prod.yml ps`
2. **View Database Logs**: `docker-compose -f docker-compose.prod.yml logs postgres`
3. **Verify Environment Variables**: Ensure DB_* variables are correct

### Application Issues
1. **Check Application Logs**: `docker-compose -f docker-compose.prod.yml logs app`
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
4. **Regular Updates**: Keep Docker images and dependencies updated
5. **Monitor Logs**: Set up log monitoring for security events
6. **Backup Database**: Implement regular database backups
7. **Use Secrets Management**: Consider using Docker secrets for sensitive data

## 📞 Support

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Test with a simple curl request to isolate issues 