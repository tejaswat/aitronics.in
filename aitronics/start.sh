#!/bin/bash
set -euo pipefail

export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-/tmp/.config}"
mkdir -p "$XDG_CONFIG_HOME"
export HMR_PORT="${HMR_PORT:-5173}"

# Make sure the admin build exists before starting Medusa
if [ ! -f "./build/admin/index.html" ]; then
  yarn build
fi

# Run migrations once per container lifetime to ensure schema exists
if [ ! -f ".migrated" ]; then
  yarn medusa db:migrate
  touch .migrated
fi

yarn start
