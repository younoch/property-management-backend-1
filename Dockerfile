# ---------- Stage 1: deps (install all deps incl dev for build) ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Clear npm cache and install all dependencies including devDependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps
  
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
      npm install --omit=dev --legacy-peer-deps
  
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
  