# Use Node.js 22 Alpine as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Command to run the reset script and exit
CMD ["sh", "-c", "node dist/main && exit 0"]