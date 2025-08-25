# ---------- Stage 1: deps (pnpm only to speed up build) ----------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i --frozen-lockfile

# ---------- Stage 2: builder (runs nest build -> dist/main.js) ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# makes sure dist/main.js (not dist/src/main.js) is produced:
# nest-cli.json -> { "sourceRoot": "src", "compilerOptions": { "outputPath": "dist" } }
# tsconfig.build.json -> rootDir: "./src", outDir: "./dist"
RUN pnpm run build

# ---------- Stage 3: production (npm, prod deps only) ----------
FROM node:22-alpine AS production
WORKDIR /app

# non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# install only prod deps with npm (no package-lock required)
COPY package.json ./
RUN npm i --omit=dev

# copy compiled app
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
# optional healthcheck script if you use it
COPY --chown=nestjs:nodejs healthcheck.js ./healthcheck.js

USER nestjs
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/main.js"]
