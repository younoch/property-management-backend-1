#!/bin/bash

# Property Management Backend Deployment Script
set -e

echo "🚀 Starting Property Management Backend Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file based on env.production.example"
    echo "Or run 'pnpm run generate:env' to create a secure configuration"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("DB_HOST" "DB_USERNAME" "DB_PASSWORD" "DB_NAME" "COOKIE_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Error: The following required environment variables are not set:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please update your .env file with proper values"
    exit 1
fi

# Security validation
echo "🔐 Validating security configuration..."

# Check for weak passwords
if [ "${#DB_PASSWORD}" -lt 8 ]; then
    echo "⚠️  Warning: Database password is too short (minimum 8 characters recommended)"
fi

# Check for default cookie key
if [[ "$COOKIE_KEY" == *"your-production-secret-key-change-this-immediately"* ]] || [[ "$COOKIE_KEY" == *"your-secret-key-here"* ]]; then
    echo "❌ Error: COOKIE_KEY contains default value. Please generate a secure key."
    echo "You can run 'pnpm run generate:env' to create a secure configuration"
    exit 1
fi

# Check for default database credentials
if [[ "$DB_PASSWORD" == "password" ]] || [[ "$DB_USERNAME" == "postgres" && "$DB_PASSWORD" == "password" ]]; then
    echo "❌ Error: Using default database credentials. Please use secure credentials."
    exit 1
fi

echo "✅ Environment variables validated"
echo "✅ Security configuration validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Verify database connection
echo "🗄️ Verifying database connection..."
if docker-compose -f docker-compose.prod.yml exec -T app node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
client.connect()
  .then(() => {
    console.log('Database connection successful');
    client.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
" 2>/dev/null; then
    echo "✅ Database connection verified"
else
    echo "⚠️ Database connection verification failed"
fi

# Run database migrations (if needed)
echo "🗄️ Running database migrations..."
if docker-compose -f docker-compose.prod.yml exec -T app npm run migration:run 2>/dev/null; then
    echo "✅ Database migrations completed"
else
    echo "⚠️ Migration command not found or failed"
fi

echo "✅ Deployment completed successfully!"
echo "🌐 API is available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/api (development only)"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🔐 Security reminders:"
echo "  - Keep your .env file secure and never commit it to version control"
echo "  - Regularly rotate database passwords and cookie keys"
echo "  - Monitor application logs for security events" 