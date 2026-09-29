#!/usr/bin/env bash
# Downloads the English card data (about 26 MB of JSON) and rebuilds ../data/catalog.js.
# Needs curl and Python 3. Run export-legacy.js first if you changed the marketplace cards.
set -euo pipefail
cd "$(dirname "$0")"
SRC="${1:-./_catalog_src}"; BASE="https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master"
mkdir -p "$SRC/cards"
curl -sf "$BASE/sets/en.json" -o "$SRC/sets_en.json"
python3 -c "import json;print('\n'.join(s['id'] for s in json.load(open('$SRC/sets_en.json'))))" |
  xargs -P 8 -I{} curl -sf "$BASE/cards/en/{}.json" -o "$SRC/cards/{}.json"
node export-legacy.js "$SRC/legacy_cards.json"
python3 build_catalog.py "$SRC" "$SRC/legacy_cards.json"
