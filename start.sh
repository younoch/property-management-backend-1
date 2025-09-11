#!/bin/bash

# -----------------------------
# Colors
# -----------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# -----------------------------
# Print functions
# -----------------------------
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# -----------------------------
# Load .env
# -----------------------------
if [ -f .env.development ]; then
    source .env.development
else
    error ".env.development not found!"
    exit 1
fi

# -----------------------------
# Ensure Docker is running
# -----------------------------
if ! docker info >/dev/null 2>&1; then
    error "Docker is not running!"
    exit 1
fi

# -----------------------------
# Start Docker services
# -----------------------------
info "Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait a few seconds for Postgres
info "Waiting for database to be ready..."
sleep 5

# -----------------------------
# Start NestJS in dev mode
# -----------------------------
info "Starting NestJS in development mode..."
pnpm run start:dev
