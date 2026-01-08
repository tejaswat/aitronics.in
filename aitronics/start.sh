#!/bin/bash
set -euo pipefail

# Run migrations once per container lifetime to ensure schema exists
if [ ! -f ".migrated" ]; then
  yarn medusa migrations run
  touch .migrated
fi

yarn start
