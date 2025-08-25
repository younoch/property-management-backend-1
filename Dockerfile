# ---------- Build stage ----------
FROM node:22-alpine AS builder
WORKDIR /app

# install pnpm for build
RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# debug: confirm dist exists
RUN echo "---- ls dist ----" && ls -la dist

# ---------- Production stage ----------
FROM node:22-alpine AS production
WORKDIR /app

# create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY package*.json package-lock.json ./
RUN npm install --omit=dev

# copy built app from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist/ ./dist/

# copy healthcheck if you need it
COPY --chown=nestjs:nodejs healthcheck.js ./healthcheck.js

RUN mkdir -p logs && chown -R nestjs:nodejs logs
USER nestjs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/main.js"]
