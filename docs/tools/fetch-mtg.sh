#!/usr/bin/env bash
# Downloads Card Kingdom's price lists and MTGJSON's printings (about 250 MB) and rebuilds ../data/mtg.js, then checks it against them.
# Needs curl and Python 3, and about 6 GB of memory. Takes a few minutes.
set -euo pipefail
cd "$(dirname "$0")"
SRC="${1:-./_mtg_src}"; mkdir -p "$SRC"
curl -sf "https://api.cardkingdom.com/api/pricelist" -o "$SRC/pricelist.json"
curl -sf "https://api.cardkingdom.com/api/sealed_pricelist" -o "$SRC/sealed_pricelist.json"
curl -sf "https://mtgjson.com/api/v5/AllPrintings.json.gz" -o "$SRC/AllPrintings.json.gz"
python3 build_mtg.py "$SRC/pricelist.json" "$SRC/sealed_pricelist.json" "$SRC/AllPrintings.json.gz"
python3 check_mtg.py "$SRC/pricelist.json" "$SRC/sealed_pricelist.json" "$SRC/AllPrintings.json.gz"
