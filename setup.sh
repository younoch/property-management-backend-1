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

# Start PostgreSQL database
echo "🐘 Starting PostgreSQL database..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify .env.development has correct database credentials"
echo "2. Run 'pnpm run start:dev' to start the development server"
echo "3. Run 'pnpm run test' to run tests"
echo ""
echo "Database is running on localhost:5432"
echo "Application will run on localhost:8000"
echo ""
echo "📋 Useful commands:"
echo "  🚀 Start development: pnpm run start:dev"
echo "  🧪 Run tests: pnpm run test"
echo "  🗄️  Database logs: docker-compose logs postgres"
echo "  🛑 Stop database: docker-compose down" 