# ---------- Base Stage: Install build dependencies ----------
FROM node:22-alpine AS base
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Set npm registry and retry settings
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Clean npm cache and install with retry logic
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --prefer-offline --no-audit || \
    (sleep 5 && npm install --legacy-peer-deps --prefer-offline --no-audit) || \
    (sleep 10 && npm install --legacy-peer-deps --prefer-offline --no-audit)

# ---------- Stage 1: deps (copy node_modules from base) ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY package*.json ./
COPY .npmrc* ./
  
  # ---------- Stage 2: builder (compile TS -> JS) ----------
  FROM node:22-alpine AS builder
  WORKDIR /app
  
  # Bring node_modules from deps to have nest/tsc available
  COPY --from=deps /app/node_modules ./node_modules
  
  # Copy the rest of the source (ts, configs, assets)
  COPY . .
  
  # Ensure these files are in repo:
  # - nest-cli.json  -> { "sourceRoot": "src", "compilerOptions": { "outputPath": "dist" } }
  # - tsconfig.build.json -> rootDir: "./src", outDir: "./dist"
  # - tsconfig.json
  RUN npm run build
  
  # ---------- Stage 3: production (only prod deps + built dist) ----------
  FROM node:22-alpine AS production
  WORKDIR /app
  ENV NODE_ENV=production
  
  # Copy manifest and install ONLY prod deps
  COPY package*.json ./
  RUN npm cache clean --force && \
      npm install --omit=dev --legacy-peer-deps --prefer-offline --no-audit || \
      (sleep 5 && npm install --omit=dev --legacy-peer-deps --prefer-offline --no-audit) || \
      (sleep 10 && npm install --omit=dev --legacy-peer-deps --prefer-offline --no-audit) && \
      npm cache clean --force
  
# Copy compiled app
COPY --from=builder /app/dist ./dist

# Copy only production node_modules
COPY --from=builder /app/node_modules ./node_modules

# Optional: healthcheck script (only if you actually have this file)
# COPY healthcheck.js ./healthcheck.js

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 \
  && mkdir -p logs && chown -R nestjs:nodejs logs
USER nestjs

# Environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Expose the port the app runs on
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {if(r.statusCode !== 200) throw new Error(r.statusCode)}).on('error', (e) => {console.error(e); process.exit(1)})"

# Start the application
CMD ["node", "dist/main"]
  