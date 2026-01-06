# Multi-stage build for Next.js (App Router) optimized for Coolify

# --- Builder ---
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps without dev user to cache properly
COPY package.json package-lock.json* ./
RUN npm ci --production=false

COPY . ./
RUN mkdir -p public
RUN npm run build

# --- Production image ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Create non-root user
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

# Copy only production artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Ensure permissions
RUN chown -R appuser:appgroup /app
# install curl for healthchecks
RUN apk add --no-cache curl
USER appuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD ["/bin/sh","-c","curl -fsS http://localhost:3000/api/health | grep -q ok || exit 1"]

CMD ["npm","start"]
