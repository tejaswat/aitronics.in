# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Needed by some native deps
RUN apk add --no-cache libc6-compat

# ---------- Dependencies ----------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
# Use npm since your local uses npm
RUN npm ci

# ---------- Build ----------
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure TS config exists (you have tsconfig.json)
RUN npm run build || true

# ---------- Runtime ----------
FROM base AS runner
WORKDIR /app

# Copy app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app ./

# If you store uploads locally
RUN mkdir -p /app/uploads

EXPOSE 9000

# Run migrations then start
CMD ["sh", "-lc", "npx medusa db:migrate && npm run start"]
