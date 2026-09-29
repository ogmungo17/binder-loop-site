#!/usr/bin/env bash
# Downloads the current sealed-product price list and rebuilds ../data/sealed.js. Needs curl and Python 3.
set -euo pipefail
cd "$(dirname "$0")"
SRC="${1:-./_catalog_src}"; mkdir -p "$SRC"
curl -sf "https://raw.githubusercontent.com/brentsharon/pokesave-data/main/data/sealed-prices.json" -o "$SRC/sealed-prices.json"
[ -f "$SRC/sets_en.json" ] || curl -sf "https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/sets/en.json" -o "$SRC/sets_en.json"
python3 build_sealed.py "$SRC/sealed-prices.json" "$SRC/sets_en.json"
