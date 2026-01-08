#!/bin/sh
set -e

echo "Waiting for postgres..."
until pg_isready -h postgres -p 5432 -U postgres >/dev/null 2>&1; do
  sleep 2
done

echo "Running migrations..."
npx medusa db:migrate

echo "Starting Medusa..."
npm run start
