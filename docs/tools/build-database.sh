#!/usr/bin/env bash
# Rebuild everything in ../database from the site's own data and code.
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --silent
node export-data.js
python3 build_sqlite.py
