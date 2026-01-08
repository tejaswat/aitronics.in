#!/bin/sh
set -e

echo "---- Effective env (sanity) ----"
echo "DATABASE_URL=${DATABASE_URL}"
echo "REDIS_URL=${REDIS_URL}"
echo "PORT=${PORT}"

# Basic validation so failures are obvious
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is empty"
  exit 1
fi

if [ -z "$REDIS_URL" ]; then
  echo "ERROR: REDIS_URL is empty (this is why you see 'redisUrl not found')"
  exit 1
fi

# Wait for Postgres (service name: postgres)
echo "Waiting for postgres:5432..."
until nc -z postgres 5432; do
  sleep 2
done
echo "Postgres is reachable."

# Wait for Redis (service name: redis)
echo "Waiting for redis:6379..."
until nc -z redis 6379; do
  sleep 2
done
echo "Redis is reachable."

echo "Running migrations..."
yarn medusa db:migrate

echo "Starting Medusa..."
exec yarn start
