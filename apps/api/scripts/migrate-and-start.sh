#!/bin/sh
set -e

echo "Running database migrations..."
pnpm prisma migrate deploy || echo "Migration failed or already applied, continuing..."

if [ "$SEED_ON_BOOT" = "true" ]; then
  echo "Seeding database..."
  pnpm prisma db seed || echo "Seeding skipped or already done"
fi

echo "Starting application..."
exec node dist/index.js