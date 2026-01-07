# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9000

# copy built app + deps
COPY --from=build /app /app

EXPOSE 9000
CMD ["yarn","start"]
