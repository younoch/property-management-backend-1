#!/bin/bash

echo "🚀 Starting Property Management Backend with Docker..."

# -----------------------------
# Colors for output
# -----------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------
# Print functions
# -----------------------------
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# -----------------------------
# Load environment variables
# -----------------------------
if [ -f .env.development ]; then
    source .env.development
else
    print_error ".env.development not found!"
    print_status "Run './setup.sh' or 'pnpm run generate:env' to create it."
    exit 1
fi

# -----------------------------
# Set defaults if missing
# -----------------------------
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres123}
DB_NAME=${DB_NAME:-property_rental_management_db}

# -----------------------------
# Validate required env vars
# -----------------------------
required_vars=("DB_HOST" "DB_USERNAME" "DB_PASSWORD" "DB_NAME")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env.development"
        exit 1
    fi
done

# -----------------------------
# Check Docker
# -----------------------------
if ! sudo docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Start Docker first."
    exit 1
fi

# -----------------------------
# Start PostgreSQL container if not running
# -----------------------------
POSTGRES_CONTAINER="property_rental_management_postgres_dev"

if sudo docker ps --format "{{.Names}}" | grep -q "$POSTGRES_CONTAINER"; then
    print_warning "PostgreSQL container is already running."
else
    print_status "Starting PostgreSQL container..."
    if sudo docker compose -f docker-compose.dev.yml up -d; then
        print_success "PostgreSQL started successfully!"
    else
        print_error "Failed to start PostgreSQL. Check Docker logs."
        exit 1
    fi
fi

# -----------------------------
# Wait for PostgreSQL to be ready
# -----------------------------
print_status "Waiting for PostgreSQL to be ready..."
sleep 5

print_status "Testing database connection..."
for i in {1..5}; do
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection successful!"
        break
    else
        if [ $i -eq 5 ]; then
            print_error "Database connection failed after 5 attempts."
            print_status "Check container logs: sudo docker logs $POSTGRES_CONTAINER"
            print_status "Verify your .env.development credentials."
            exit 1
        fi
        print_warning "Database connection failed. Retrying... (Attempt $i/5)"
        sleep 5
    fi
done

# -----------------------------
# Check if application is running
# -----------------------------
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_warning "Application is already running on port 8000."
    print_status "Access your application:"
    echo "  🌐 Main App: http://localhost:8000"
    echo "  📚 API Docs: http://localhost:8000/api"
    echo "  ❤️ Health: http://localhost:8000/health"
    echo "  📊 Metrics: http://localhost:8000/metrics"
    exit 0
fi

# -----------------------------
# Start the NestJS application
# -----------------------------
print_status "Starting NestJS application..."
pnpm run start:dev &
APP_PID=$!

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

# -----------------------------
# Save PID for stop script
# -----------------------------
echo $APP_PID > .app.pid

# -----------------------------
# Application info
# -----------------------------
print_success "🎉 Property Management Backend is now running with Docker!"
echo ""
echo "📋 Access your application:"
echo "  🌐 Main App: http://localhost:8000"
echo "  📚 API Docs: http://localhost:8000/api"
echo "  ❤️ Health: http://localhost:8000/health"
echo "  📊 Metrics: http://localhost:8000/metrics"
echo ""
echo "📋 Available commands:"
echo "  🛑 Stop application: ./stop.sh"
echo "  🔄 Restart: ./stop.sh && ./start.sh"
echo "  🗄️  Reset database: sudo docker compose -f docker-compose.dev.yml down -v && sudo docker compose -f docker-compose.dev.yml up -d"
echo "  📊 View logs: sudo docker logs $POSTGRES_CONTAINER"
echo ""
echo "💡 Press Ctrl+C to stop the application or run './stop.sh' in another terminal."

# -----------------------------
# Keep the script running
# -----------------------------
wait $APP_PID
