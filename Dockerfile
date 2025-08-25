# ---------- Build stage ----------
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Optional: prove dist exists in CI logs
RUN echo "---- ls dist ----" && ls -la dist

# ---------- Production stage ----------
FROM node:22-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile --prod

# Copy compiled app (note the trailing slashes)
COPY --from=builder --chown=nestjs:nodejs /app/dist/ ./dist/

# If your HEALTHCHECK calls this, you must copy it
COPY --chown=nestjs:nodejs healthcheck.js ./healthcheck.js

RUN mkdir -p logs && chown -R nestjs:nodejs logs
USER nestjs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/main.js"]
