#!/bin/sh

# Set environment variables
export NODE_ENV=production

# Install production dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "Installing production dependencies..."
  pnpm install --prod --frozen-lockfile
fi

# Run database migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  pnpm run migration:run
fi

# Start the application
echo "Starting application..."
exec node dist/main.js
