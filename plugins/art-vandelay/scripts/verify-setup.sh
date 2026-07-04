#!/usr/bin/env bash
# Idempotent setup for browser-based verification, run against whatever
# project is in the current working directory (this plugin's own install
# location is irrelevant — never cd based on $0). Installs playwright as a
# devDependency, the chromium binary, and a scripts/screenshot.mjs +
# "screenshot" npm script in the current project, each only if missing.
# Safe to run every time — does nothing on a repeat run.
set -euo pipefail

if npm ls playwright --depth=0 >/dev/null 2>&1; then
  echo "playwright: already a devDependency"
else
  echo "playwright: installing devDependency"
  npm install -D playwright
fi

CACHE="$HOME/Library/Caches/ms-playwright"
if ls "$CACHE"/chromium-* >/dev/null 2>&1; then
  echo "chromium: already cached in $CACHE"
else
  echo "chromium: installing"
  npx playwright install chromium
fi

PLUGIN_DIR="$(dirname "$0")"
if [ -f scripts/screenshot.mjs ]; then
  echo "scripts/screenshot.mjs: already present"
else
  echo "scripts/screenshot.mjs: bootstrapping from plugin template"
  mkdir -p scripts
  cp "$PLUGIN_DIR/screenshot.mjs" scripts/screenshot.mjs
fi

if npm pkg get scripts.screenshot | grep -q screenshot.mjs; then
  echo "npm run screenshot: already wired up"
else
  echo "npm run screenshot: adding to package.json"
  npm pkg set scripts.screenshot="node scripts/screenshot.mjs"
fi
