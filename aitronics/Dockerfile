# ==========================================
# Medusa backend - production Dockerfile
# Folder: aitronics/Dockerfile
# ==========================================

FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build (creates .medusa/server for Medusa build output)
RUN npm run build

# ---------------- Runtime ----------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

# Copy built output + package files
COPY --from=build /app/.medusa /app/.medusa
COPY --from=build /app/package*.json /app/

# Install production deps at root (if required by your build)
RUN npm ci --omit=dev

# Install production deps inside the built server bundle
WORKDIR /app/.medusa/server
COPY --from=build /app/.medusa/server/package*.json /app/.medusa/server/
RUN npm ci --omit=dev

WORKDIR /app

# Medusa usually listens on 9000
EXPOSE 9000

CMD ["sh", "-lc", "cd .medusa/server && npm run start"]
