#!/bin/bash
set -euo pipefail

export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-/tmp/.config}"
mkdir -p "$XDG_CONFIG_HOME"
export HMR_PORT="${HMR_PORT:-5173}"

# Make sure the admin build exists before starting Medusa
ADMIN_BUILD_DIR=".medusa/server/public/admin"
PUBLIC_ADMIN_DIR="public/admin"
if [ ! -f "$ADMIN_BUILD_DIR/index.html" ]; then
  yarn build
fi
mkdir -p "$(dirname "$PUBLIC_ADMIN_DIR")"
rm -rf "$PUBLIC_ADMIN_DIR"
cp -a "$ADMIN_BUILD_DIR" "$PUBLIC_ADMIN_DIR"

# Run migrations once per container lifetime to ensure schema exists
if [ ! -f ".migrated" ]; then
  yarn medusa db:migrate
  touch .migrated
fi

yarn start
