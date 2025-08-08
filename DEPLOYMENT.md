# Property Management Backend - Deployment Guide

## 🚀 Production Deployment

This guide will help you deploy the Property Management Backend to production with proper CORS configuration and environment setup.

## Prerequisites

- Docker and Docker Compose installed
- A domain name (for CORS configuration)
- PostgreSQL database (or use the included PostgreSQL container)

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
   - `ALLOWED_ORIGINS`: Your frontend domain(s) separated by commas
   - `DB_PASSWORD`: A secure database password
   - `COOKIE_KEY`: A strong secret key for session cookies
   - `DB_HOST`: Your database host (use `postgres` if using Docker)

   **Example:**
   ```env
   NODE_ENV=production
   PORT=8000
   ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com
   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=my-secure-password-123
   DB_NAME=property_rental_management_prod
   DB_SYNC=false
   DB_SSL=false
   COOKIE_KEY=my-super-secret-cookie-key-123456789
   ```

## Step 2: Deploy with Docker

### Option A: Using the deployment script (Recommended)
```bash
./deploy.sh
```

### Option B: Manual deployment
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up --build -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Step 3: Verify Deployment

1. **Check if the API is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test CORS configuration:**
   ```bash
   curl -H "Origin: https://yourdomain.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS http://localhost:8000/users
   ```

## Step 4: Database Migrations

If you have database migrations, run them:
```bash
docker-compose -f docker-compose.prod.yml exec app npm run migration:run
```

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