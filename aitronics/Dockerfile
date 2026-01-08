FROM node:20-alpine

WORKDIR /app

# Install OS deps needed by some node packages
RUN apk add --no-cache libc6-compat bash netcat-openbsd

# Copy dependency manifests first for better caching
COPY package.json yarn.lock ./

# Install deps
RUN corepack enable && yarn install --frozen-lockfile

# Copy the rest of the backend code (includes medusa-config.*)
COPY . .

# Ensure entrypoint is executable
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
EXPOSE 9000

ENTRYPOINT ["/entrypoint.sh"]
