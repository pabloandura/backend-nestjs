# ── Stage 1: base ────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare yarn@stable --activate

# ── Stage 2: deps (all dependencies) ─────────────────────────────────────────
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ── Stage 3: development (hot-reload via ts-node / nest start --watch) ────────
FROM deps AS development
COPY . .
CMD ["yarn", "start:dev"]

# ── Stage 4: build (compile TypeScript) ──────────────────────────────────────
FROM deps AS builder
COPY . .
RUN yarn build

# ── Stage 5: production (minimal image, non-root user) ───────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install only production dependencies
COPY package.json yarn.lock ./
RUN corepack enable && corepack prepare yarn@stable --activate \
    && yarn install --frozen-lockfile --production \
    && yarn cache clean

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Uploads directory (will be empty in prod — S3 handles storage)
RUN mkdir -p uploads && chown appuser:appgroup uploads

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
