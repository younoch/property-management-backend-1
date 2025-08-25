# ---------- Production stage ----------
FROM node:22-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# copy just package.json (no package-lock.json)
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# copy built dist from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist/ ./dist/
COPY --chown=nestjs:nodejs healthcheck.js ./healthcheck.js

RUN mkdir -p logs && chown -R nestjs:nodejs logs
USER nestjs
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/main.js"]
