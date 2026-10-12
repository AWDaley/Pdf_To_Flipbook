#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo 'Install Node.js 24.13.0 first. See README.md.' >&2
  exit 1
fi
if [ ! -f node_modules/tsx/package.json ]; then
  echo 'First run npm ci from this folder. See README.md.' >&2
  exit 1
fi
npm run build
exec node scripts/launch.mjs
