# ==========================================
# Next.js storefront - production Dockerfile
# Folder: aitronics-storefront/Dockerfile
# ==========================================

FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------------- Runtime ----------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

# Copy Next standalone output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
