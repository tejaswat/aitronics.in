#!/bin/bash
set -euo pipefail

# Run migrations once per container lifetime to ensure schema exists
if [ ! -f ".migrated" ]; then
  yarn medusa db:migrate
  touch .migrated
fi

yarn start
