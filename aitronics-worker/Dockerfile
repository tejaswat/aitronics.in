FROM node:20-slim

WORKDIR /app

# Install dependencies using the lockfile and keep cache small
COPY package.json yarn.lock ./
RUN yarn install --immutable --inline-builds

# Copy the rest of the application and build
COPY . .
RUN yarn build

# Expose port and set defaults
ENV NODE_ENV=production
ENV PORT=9000
ENV MEDUSA_WORKER_MODE=worker
EXPOSE 9000

# Ensure migrations run once before starting Medusa
COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
