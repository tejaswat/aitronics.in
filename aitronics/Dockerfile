# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/yarn.lock ./
RUN yarn install

COPY backend ./

EXPOSE 9000

CMD ["yarn", "start"]
