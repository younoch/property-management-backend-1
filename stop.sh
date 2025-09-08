#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "🛑 Stopping Property Management Backend services..."


# Stop the NestJS application
print_status "Stopping NestJS application..."

# Kill application process if PID file exists
if [ -f .app.pid ]; then
    APP_PID=$(cat .app.pid)
    if ps -p $APP_PID > /dev/null 2>&1; then
        print_status "Killing application process (PID: $APP_PID)..."
        kill $APP_PID 2>/dev/null
        sleep 2
        if ps -p $APP_PID > /dev/null 2>&1; then
            print_warning "Application process still running, force killing..."
            kill -9 $APP_PID 2>/dev/null
        fi
        print_success "Application stopped!"
    else
        print_warning "Application process not found."
    fi
    rm -f .app.pid
else
    print_warning "No PID file found. Killing any running NestJS processes..."
    pkill -f "nest start" 2>/dev/null
fi

# Stop MailHog if running
if docker ps --format '{{.Names}}' | grep -q "^mailhog$"; then
    print_status "Stopping MailHog..."
    if docker stop mailhog > /dev/null; then
        docker rm mailhog > /dev/null
        print_success "MailHog stopped and removed."
    else
        print_error "Failed to stop MailHog."
    fi
else
    print_warning "MailHog is not running."
fi
    pkill -f "pnpm.*start:dev" 2>/dev/null

# Additional cleanup for any remaining processes
print_status "Cleaning up any remaining processes..."
pkill -f "cross-env.*nest start" 2>/dev/null
pkill -f "node.*nest.js" 2>/dev/null

# Check if application is still running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_warning "Application is still responding. Force stopping..."
    # Find and kill any process using port 8000
    PORT_PID=$(lsof -ti:8000 2>/dev/null)
    if [ ! -z "$PORT_PID" ]; then
        kill -9 $PORT_PID 2>/dev/null
        print_success "Port 8000 freed!"
    fi
else
    print_success "Application stopped successfully!"
fi

# Stop PostgreSQL container if running
if docker ps --format '{{.Names}}' | grep -q "^property_rental_management_postgres_dev$"; then
    print_status "Stopping PostgreSQL container..."
    if docker-compose -f docker-compose.dev.yml down; then
        print_success "PostgreSQL container stopped and removed!"
    else
        print_error "Failed to stop PostgreSQL container."
    fi
else
    print_warning "PostgreSQL container is not running."
fi

# Remove the network if no containers are using it
NETWORK_NAME="property_management_backend_property_dev_network"
if docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
    if [ -z "$(docker network inspect -f '{{.Containers}}' $NETWORK_NAME 2>/dev/null)" ]; then
        print_status "Removing unused network: $NETWORK_NAME"
        docker network rm $NETWORK_NAME 2>/dev/null
    fi
fi

print_success "✅ All services have been stopped successfully!"

print_success "🎉 SaaS Boilerplate stopped successfully!"
echo ""
echo "📋 To start again:"
echo "  🚀 ./start.sh"
echo ""
echo "📋 Other useful commands:"
echo "  🗄️  Start PostgreSQL only: sudo docker compose -f docker-compose.dev.yml up -d"
echo "  🗄️  Stop PostgreSQL only: sudo docker-compose -f docker-compose.dev.yml down"
echo "  🔄 Reset database: sudo docker-compose -f docker-compose.dev.yml down -v && sudo docker compose -f docker-compose.dev.yml up -d"
echo "  📊 View logs: sudo docker logs property_rental_management_postgres_dev" 