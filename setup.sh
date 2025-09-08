#!/bin/bash

echo "🚀 Setting up Property Management Backend with PostgreSQL..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment files
echo "📋 Setting up environment files..."
if [ ! -f .env.development ]; then
    echo "🔐 Generating secure environment configuration..."
    if command -v node > /dev/null 2>&1; then
        pnpm run generate:env
        echo "✅ Created .env.development with secure credentials"
    else
        cp env.example .env.development
        echo "⚠️  Created .env.development from template - please update credentials"
    fi
else
    echo "⚠️  .env.development already exists"
fi

if [ ! -f .env.test ]; then
    cp env.test.example .env.test
    echo "✅ Created .env.test"
else
    echo "⚠️  .env.test already exists"
fi

if [ ! -f .env.production ]; then
    cp env.production.example .env.production
    echo "✅ Created .env.production"
    echo "⚠️  IMPORTANT: Update .env.production with your production credentials"
else
    echo "⚠️  .env.production already exists"
fi

# Start development services
echo "🚀 Starting development services (PostgreSQL & MailHog)..."

# Create a custom network if it doesn't exist
NETWORK_NAME="property_management_backend_property_dev_network"
if ! docker network ls | grep -q $NETWORK_NAME; then
    docker network create $NETWORK_NAME
fi

# Start services
docker-compose -f docker-compose.dev.yml up -d

# Start MailHog for email testing
echo "📧 Starting MailHog for email testing..."
# Remove existing MailHog container if it exists
docker rm -f mailhog 2>/dev/null || true

# Start MailHog container
docker run -d --name mailhog \
    --network $NETWORK_NAME \
    -p 1025:1025 \
    -p 8025:8025 \
    mailhog/mailhog

echo "✅ MailHog is running at http://localhost:8025"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Update .env.development with MailHog settings if not already present
if ! grep -q "MAILHOG" .env.development; then
    echo "
# Email Configuration for Development (MailHog)
EMAIL_ENABLED=true
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
DEFAULT_FROM_EMAIL=development@localhost" >> .env.development
    echo "✅ Updated .env.development with MailHog settings"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "🌐 Services running:"
echo "  - Application: http://localhost:8000"
echo "  - PostgreSQL: localhost:5432"
echo "  - MailHog (Email Testing): http://localhost:8025"
echo ""
echo "📋 Next steps:"
echo "1. Verify database connection in .env.development"
echo "2. Start development server: pnpm run start:dev"
echo "3. Run tests: pnpm run test"
echo ""
echo "🔧 Useful commands:"
echo "  🚀 Start development: pnpm run start:dev"
echo "  🧪 Run tests: pnpm test"
echo "  📧 View emails: open http://localhost:8025"
echo "  🗄️  Database logs: docker-compose logs -f postgres"
echo "  📝 Application logs: pnpm run start:dev"
echo "  🛑 Stop all services: docker-compose down && docker stop mailhog"
echo ""
echo "💡 Tip: All emails sent in development will be captured by MailHog"