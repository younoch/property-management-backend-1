# ---------- Stage 1: deps (install all deps incl dev for build) ----------
FROM node:22-alpine AS deps
WORKDIR /app

# If you don't commit package-lock.json, this still works
COPY package*.json ./
RUN npm ci

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
RUN npm ci --omit=dev

# Copy compiled app
COPY --from=builder /app/dist ./dist

# Optional: healthcheck script (only if you actually have this file)
# COPY healthcheck.js ./healthcheck.js

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 \
  && mkdir -p logs && chown -R nestjs:nodejs logs
USER nestjs

EXPOSE 8000

# If you kept start:prod = "node dist/main", either works, but be explicit:
# If you prefer to use the script:
CMD ["npm", "run", "start:prod"]
