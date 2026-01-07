FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Enable Yarn via corepack
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# Build
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
RUN corepack enable

COPY --from=build /app/.medusa /app/.medusa
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock

# Install prod deps
RUN yarn install --frozen-lockfile --production=true

# Install prod deps for built server bundle
WORKDIR /app/.medusa/server
COPY --from=build /app/.medusa/server/package.json /app/.medusa/server/package.json
COPY --from=build /app/.medusa/server/yarn.lock /app/.medusa/server/yarn.lock
RUN yarn install --frozen-lockfile --production=true

WORKDIR /app
EXPOSE 9000
CMD ["sh", "-lc", "cd .medusa/server && yarn start"]
