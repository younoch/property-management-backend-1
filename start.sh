#!/bin/bash

echo "🚀 Starting Property Management Backend with Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
if [ ! -f .env.development ]; then
    print_error "Environment file .env.development not found!"
    print_status "Please run 'pnpm run generate:env' to create a secure environment configuration"
    exit 1
fi

# Load environment variables
source .env.development

# Validate required environment variables
required_vars=("DB_HOST" "DB_USERNAME" "DB_PASSWORD" "DB_NAME")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env.development"
        exit 1
    fi
done

# Check if Docker is running
if ! sudo docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if PostgreSQL container is already running
if sudo docker ps --format "table {{.Names}}" | grep -q "property_rental_management_postgres"; then
    print_warning "PostgreSQL container is already running."
elif sudo docker ps --format "table {{.Names}}" | grep -q "property_rental_management_postgres_dev"; then
    print_warning "PostgreSQL development container is already running."
else
    print_status "Starting PostgreSQL with Docker..."
    if sudo docker-compose -f docker-compose.dev.yml up -d; then
        print_success "PostgreSQL started successfully!"
    else
        print_error "Failed to start PostgreSQL. Please check Docker logs."
        exit 1
    fi
fi

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 5

# Test database connection using environment variables
print_status "Testing database connection..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection successful!"
else
    print_warning "Database connection failed. Waiting a bit more..."
    sleep 10
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection successful!"
    else
        print_error "Database connection failed. Please check PostgreSQL container and environment variables."
        print_status "You can check container logs with: sudo docker logs property_rental_management_postgres_dev"
        print_status "Verify your .env.development file has correct database credentials"
        exit 1
    fi
fi

# Check if application is already running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_warning "Application is already running on port 8000."
    print_status "Access your application at:"
    echo "  🌐 Main Application: http://localhost:8000"
    echo "  📚 API Documentation: http://localhost:8000/api"
    echo "  ❤️  Health Check: http://localhost:8000/health"
    echo "  📊 Metrics: http://localhost:8000/metrics"
    exit 0
fi

# Start the application
print_status "Starting NestJS application..."
print_status "This may take a few moments..."

# Start the application in the background
pnpm run start:dev &
APP_PID=$!

# Wait for application to start
print_status "Waiting for application to start..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Application started successfully!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Application failed to start within 30 seconds."
        kill $APP_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Save PID to file for stop script
echo $APP_PID > .app.pid

print_success "🎉 Property Management Backend is now running with Docker!"
echo ""
echo "📋 Access your application:"
echo "  🌐 Main Application: http://localhost:8000"
echo "  📚 API Documentation: http://localhost:8000/api"
echo "  ❤️  Health Check: http://localhost:8000/health"
echo "  📊 Metrics: http://localhost:8000/metrics"
echo ""
echo "📋 Available commands:"
echo "  🛑 Stop application: ./stop.sh"
echo "  🔄 Restart application: ./stop.sh && ./start.sh"
echo "  🗄️  Reset database: sudo docker compose -f docker-compose.dev.yml down -v && sudo docker-compose -f docker-compose.dev.yml up -d"
echo "  📊 View logs: sudo docker logs property_rental_management_postgres_dev"
echo ""
echo "💡 Press Ctrl+C to stop the application"
echo "💡 Or run './stop.sh' in another terminal"

# Keep the script running to show logs
wait $APP_PID 