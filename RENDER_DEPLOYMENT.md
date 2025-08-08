# Render.com Deployment Guide

## 🚀 Deploy to Render.com (Free Tier)

This guide will help you deploy your Property Management Backend to Render.com using the free tier.

## Prerequisites

- GitHub repository with your code
- Render.com account
- Domain name (optional)

## Step 1: Prepare Your Repository

### 1.1 Update Environment Configuration

Your app is already Render-ready! The cache manager uses in-memory caching, so no Redis is needed.

### 1.2 Verify Build Commands

Your `package.json` already has the correct scripts:
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main"
  }
}
```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Connect your GitHub repository to Render**
2. **Render will automatically detect the `render.yaml` file**
3. **Deploy with one click**

### Option B: Manual Deployment

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

#### **Basic Settings:**
- **Name**: `property-management-api`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (if code is in root)

#### **Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

#### **Environment Variables:**
```
NODE_ENV=production
PORT=10000
DB_SYNC=false
DB_SSL=true
ALLOWED_ORIGINS=https://your-frontend-domain.onrender.com
COOKIE_KEY=your-secure-cookie-key-here
```

## Step 3: Set Up Database

### 3.1 Create PostgreSQL Database

1. **Go to Render Dashboard**
2. **Click "New +" → "PostgreSQL"**
3. **Configure:**
   - **Name**: `property-management-db`
   - **Database**: `property_management_prod`
   - **User**: Auto-generated
   - **Plan**: Free

### 3.2 Connect Database to Web Service

1. **Go to your web service**
2. **Click "Environment" tab**
3. **Add these variables (Render will auto-fill from database):**
   ```
   DB_HOST=${DB_HOST}
   DB_PORT=${DB_PORT}
   DB_USERNAME=${DB_USERNAME}
   DB_PASSWORD=${DB_PASSWORD}
   DB_NAME=${DB_NAME}
   ```

## Step 4: Configure Environment Variables

### 4.1 Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Render's default port |
| `DB_SYNC` | `false` | Disable auto-sync in production |
| `DB_SSL` | `true` | Enable SSL for database |
| `ALLOWED_ORIGINS` | `https://your-domain.com` | Your frontend domain |
| `COOKIE_KEY` | `your-secure-key` | Generate a secure key |

### 4.2 Generate Secure Cookie Key

```bash
# Generate a secure cookie key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Deploy and Verify

### 5.1 Deploy

1. **Click "Create Web Service"**
2. **Wait for build to complete**
3. **Check deployment logs**

### 5.2 Verify Deployment

```bash
# Test health endpoint
curl https://your-app-name.onrender.com/health

# Test API endpoint
curl https://your-app-name.onrender.com/users
```

## Step 6: Database Migrations

### 6.1 Run Migrations

After deployment, run database migrations:

1. **Go to your web service**
2. **Click "Shell" tab**
3. **Run:**
   ```bash
   npm run migration:run
   ```

## 🔧 Render-Specific Configuration

### Port Configuration

Render uses port `10000` by default. Your app is already configured to use `process.env.PORT`.

### Environment Variables

Render automatically provides database connection details when you link a PostgreSQL database.

### SSL Configuration

Render provides SSL certificates automatically. Your app is configured to use SSL for database connections.

## 🚨 Important Notes for Free Tier

### Limitations:
- **Sleep after 15 minutes** of inactivity
- **Cold starts** when waking up
- **Limited bandwidth** and compute hours
- **No Redis** (but your app uses in-memory caching)

### Solutions:
- **Use external monitoring** to keep app awake
- **Optimize cold start times**
- **Consider paid tier** for production use

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check build logs
   - Verify `package.json` scripts
   - Ensure all dependencies are in `package.json`

2. **Database Connection Fails**
   - Verify database is created
   - Check environment variables
   - Ensure SSL is enabled

3. **App Won't Start**
   - Check start command
   - Verify port configuration
   - Review application logs

### Debug Commands:

```bash
# Check environment variables
echo $NODE_ENV
echo $PORT
echo $DB_HOST

# Test database connection
npm run migration:run

# Check app logs
# Use Render's log viewer
```

## 📊 Monitoring

### Health Checks:
- **Endpoint**: `/health`
- **Auto-restart**: Configured in Render
- **Logs**: Available in Render dashboard

### Performance:
- **Response times**: Monitor in Render dashboard
- **Error rates**: Check logs regularly
- **Database performance**: Monitor connection pool

## 🔒 Security

### Best Practices:
1. **Use strong cookie keys**
2. **Enable SSL for database**
3. **Set proper CORS origins**
4. **Regular security updates**
5. **Monitor logs for suspicious activity**

## 📞 Support

If you encounter issues:
1. Check Render's documentation
2. Review application logs
3. Verify environment configuration
4. Test locally with same configuration

## 🎯 Next Steps

1. **Deploy your application**
2. **Set up monitoring**
3. **Configure custom domain** (optional)
4. **Set up CI/CD** for automatic deployments
5. **Monitor performance** and scale as needed
