# =========================
# Medusa Dockerfile (Yarn)
# =========================

# --------
# Build
# --------
FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN corepack enable

# Build-time args (so `yarn build` works in CI/Coolify)
ARG DATABASE_URL="postgresql://postgres:1111@postgres:5432/postgres"
ARG DATABASE_EXTRA='{"ssl":{"rejectUnauthorized":false}}'
ARG REDIS_URL="redis://redis:6379"

ARG JWT_SECRET="supersecret"
ARG COOKIE_SECRET="supersecret"

ARG MEDUSA_ADMIN_ONBOARDING_TYPE="nextjs"
ARG MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY="aitronics-storefront"

ARG STORE_CORS="http://localhost:8000,https://docs.medusajs.com,https://aitronics.in"
ARG ADMIN_CORS="http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,https://aitronics.in"
ARG AUTH_CORS="http://localhost:5173,http://localhost:9000,http://localhost:8000,https://docs.medusajs.com,https://aitronics.in"

ARG PORT="9000"

# Export them as env for build step
ENV DATABASE_URL=$DATABASE_URL
ENV DATABASE_EXTRA=$DATABASE_EXTRA
ENV REDIS_URL=$REDIS_URL
ENV JWT_SECRET=$JWT_SECRET
ENV COOKIE_SECRET=$COOKIE_SECRET
ENV MEDUSA_ADMIN_ONBOARDING_TYPE=$MEDUSA_ADMIN_ONBOARDING_TYPE
ENV MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=$MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY
ENV STORE_CORS=$STORE_CORS
ENV ADMIN_CORS=$ADMIN_CORS
ENV AUTH_CORS=$AUTH_CORS
ENV PORT=$PORT

# Optional: disable telemetry noise during build
ENV MEDUSA_TELEMETRY_DISABLED=1

# Copy only manifests first for caching
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Build Medusa
RUN yarn build


# --------
# Runner
# --------
FROM node:20-alpine AS runner

WORKDIR /app

# pg_isready for wait loop
RUN apk add --no-cache libc6-compat postgresql-client
RUN corepack enable

RUN addgroup -S app && adduser -S app -G app

# Copy runtime artifacts
COPY --from=build /app/.medusa /app/.medusa
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock
COPY --from=build /app/node_modules /app/node_modules

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9000
ENV MEDUSA_TELEMETRY_DISABLED=1

EXPOSE 9000

USER app
CMD ["yarn", "start"]
