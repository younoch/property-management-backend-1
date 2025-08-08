#!/bin/bash

# Quick Start Script for Local Testing
set -e

echo "🚀 Quick Start - Property Management Backend"

# Check if environment generator script exists
if [ ! -f generate-env.js ]; then
    echo "❌ Error: generate-env.js not found!"
    echo "Please ensure you're in the correct directory"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with secure configuration..."
    
    # Use the environment generator for secure configuration
    if command -v node > /dev/null 2>&1; then
        echo "🔐 Generating secure environment configuration..."
        node generate-env.js
        # Rename the generated file to .env for quick start
        if [ -f .env.development ]; then
            mv .env.development .env
            echo "✅ Secure .env file created"
        else
            echo "❌ Failed to generate environment file"
            exit 1
        fi
    else
        echo "⚠️  Node.js not found, creating basic .env file..."
        cp env.production.example .env
        
        # Generate a random cookie key
        COOKIE_KEY=$(openssl rand -hex 32)
        sed -i "s/your-production-secret-key-change-this-immediately/$COOKIE_KEY/" .env
        
        echo "✅ .env file created with random cookie key"
        echo "⚠️  WARNING: Please update database credentials in .env file"
    fi
fi

# Validate required environment variables
echo "🔍 Validating environment configuration..."
source .env

required_vars=("DB_HOST" "DB_USERNAME" "DB_PASSWORD" "DB_NAME" "COOKIE_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set in .env file"
        echo "Please update your .env file with proper values"
        exit 1
    fi
done

echo "✅ Environment configuration validated"

# Set development-friendly CORS origins if not already set
if ! grep -q "ALLOWED_ORIGINS=" .env || grep -q "ALLOWED_ORIGINS=.*yourdomain" .env; then
    sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173|" .env
    echo "✅ Updated CORS origins for development"
fi

echo "🔨 Starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

echo "⏳ Waiting for services to start..."
sleep 15

echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Quick start completed!"
echo "🌐 API is available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/api"
echo ""
echo "📋 Test the API:"
echo "  curl http://localhost:8000/health"
echo ""
echo "📋 View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "📋 Stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
echo "⚠️  IMPORTANT:"
echo "  - This is for local testing only"
echo "  - For production, use proper environment configuration"
echo "  - Update database credentials if needed" 