# ---------- Stage 1: deps (install all deps incl dev for build) ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install
  
# ---------- Stage 2: builder (compile TS -> JS) ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify the dist directory was created
RUN ls -la /app/dist || (echo "Build failed - no dist directory" && exit 1)
  
# ---------- Stage 3: production (only prod deps + built dist) ----------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy package files and install only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Copy required files
COPY .env* ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 \
    && mkdir -p logs && chown -R nestjs:nodejs logs
USER nestjs

EXPOSE 8000

# Start the application
CMD ["node", "dist/main.js"]
  