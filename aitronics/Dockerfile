# =========================
# Medusa Dockerfile (Yarn)
# =========================

# --------
# Build
# --------
FROM node:20-alpine AS build

WORKDIR /app

# Needed for some node modules + yarn via corepack
RUN apk add --no-cache libc6-compat
RUN corepack enable

# Copy only manifests first for better caching
COPY package.json yarn.lock ./

# Install deps (include dev deps for build)
RUN yarn install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build Medusa (creates .medusa output)
RUN yarn build


# --------
# Runner
# --------
FROM node:20-alpine AS runner

WORKDIR /app

# Needed:
# - libc6-compat: some native deps compatibility
# - postgresql-client: provides pg_isready for your wait loop
RUN apk add --no-cache libc6-compat postgresql-client
RUN corepack enable

# Use non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy only what we need to run
COPY --from=build /app/.medusa /app/.medusa
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock
COPY --from=build /app/node_modules /app/node_modules

# If you have medusa config files at root, copy them too (safe even if not present)
# Uncomment if needed:
# COPY --from=build /app/medusa-config.* /app/
# COPY --from=build /app/.env.example /app/

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9000

EXPOSE 9000

USER app

# Default command (compose can override)
CMD ["yarn", "start"]
