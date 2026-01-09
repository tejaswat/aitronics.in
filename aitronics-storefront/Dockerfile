FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --immutable --inline-builds

# Copy source and build
COPY . .
RUN yarn build

FROM node:20-slim

WORKDIR /app

# Copy built output and dependencies
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/check-env-variables.js ./

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

CMD ["yarn", "start"]
