# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# Which folder contains medusa-config.ts/js?
# If your backend is in repo root, keep "."
# If your backend is in "backend", set BACKEND_DIR=backend in compose build args
ARG BACKEND_DIR=.

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app/${BACKEND_DIR}

# Copy only manifests first (better caching)
COPY ${BACKEND_DIR}/package.json ${BACKEND_DIR}/yarn.lock* ${BACKEND_DIR}/package-lock.json* ${BACKEND_DIR}/pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile; \
    else yarn install; fi

# ---- Build ----
FROM base AS build
ARG BACKEND_DIR=.
WORKDIR /app/${BACKEND_DIR}

COPY --from=deps /app/${BACKEND_DIR}/node_modules ./node_modules

# Copy backend source (this MUST include medusa-config.* and tsconfig.json if TS)
COPY ${BACKEND_DIR}/ ./

# If TS project: build if script exists (won't fail if absent)
RUN if [ -f package.json ] && (cat package.json | grep -q "\"build\""); then yarn build || true; fi

# ---- Runtime ----
FROM base AS runner
ARG BACKEND_DIR=.
WORKDIR /app/${BACKEND_DIR}

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9000

# Optional: disable telemetry
ENV MEDUSA_TELEMETRY_DISABLED=1

COPY --from=build /app/${BACKEND_DIR} ./

EXPOSE 9000

# Run migrations then start server
CMD sh -c "yarn medusa db:migrate && yarn start"

