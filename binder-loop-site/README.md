# Binder Loop

A standalone, static copy of the Binder Loop prototype: buy, sell and trade Pokémon cards with collectors near you,
plus a product database of singles, sealed product and PSA slabs. No build step, no server code.

## Run it locally

Open `index.html` in a browser, or serve the folder (recommended):

```bash
cd binder-loop-site
python3 -m http.server 8080      # then visit http://localhost:8080
```

## Deploy it

Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3).
Routing is hash-based (`#/app/db`, `#/app/market/listings`), so no rewrite rules are needed.
The `database/` and `tools/` folders are not needed on the live site; leave them out if you like.

## The product database

The **Database** page holds every English Pokémon TCG card (20,635 cards from 176 sets, Base Set in 1999 through
30th Celebration in September 2026, all 1,025 Pokédex numbers), 2,938 sealed products, and PSA slabs.
Three product types share one table:

| Type | What it is | Rules |
| --- | --- | --- |
| `single` | A raw card, in a specific print (Raw NM, Unlimited, Shadowless, 1st Edition) | No grade. Shadowless only for Base Set; 1st Edition only for the early sets that had it |
| `sealed` | Booster packs, bundles, boxes, ETBs, Build & Battle boxes, collection boxes, tins, blisters, decks, prerelease kits, displays, cases | Needs a kind |
| `slab` | A PSA-graded card | PSA only, grade **10, 9 or 8** and nothing lower |

Who holds what lives in a second table, `stock` (owner, status, quantity, asking price, PSA cert number).

**In the site:** open **Database** in the sidebar. The card catalogue (`data/catalog.js`) and sealed list (`data/sealed.js`), about
250 KB gzipped together, load the first time you open it. Search by name, set, card number, product or grade, filter by set, rarity,
card type, sealed kind, holder or PSA grade, sort, and page through 50 at a time. Tap a row to see who holds it. Add or edit items (cards are picked from a search box), import a CSV stock list,
and export CSV or JSON. Rows you add are saved in this browser's `localStorage`.

**As files** (in `database/`):

| File | What it is |
| --- | --- |
| `binder-loop.db` | SQLite database (sets, products, stock). The PSA 10/9/8 rule is enforced by the schema, not just the UI |
| `schema.sql` | The schema, including the `inventory` and `stock_by_type` views |
| `products.csv`, `sets.csv`, `stock.csv`, `inventory.csv` | Same data as CSV. Open straight in Excel |
| `binder-loop-database.json` | Everything in one JSON file, with the pricing metadata |

```bash
sqlite3 database/binder-loop.db "SELECT \"set\", number, rarity FROM products WHERE name='Charizard VMAX' AND type='single';"
sqlite3 database/binder-loop.db "SELECT * FROM stock_by_type;"
sqlite3 database/binder-loop.db "SELECT name, grade, owner_name, market_aud FROM inventory WHERE type='slab' ORDER BY grade DESC;"
```

### Where the data comes from, and its limits

- **Cards:** the [PokemonTCG/pokemon-tcg-data](https://github.com/PokemonTCG/pokemon-tcg-data) repository (English cards only). It now
  describes itself as a legacy project, so it may stop receiving updates. Japanese and other-language cards are not included.
- **Sealed product and its prices:** TCGplayer market prices in US dollars from
  [brentsharon/pokesave-data](https://github.com/brentsharon/pokesave-data), which repackages [TCGCSV](https://tcgcsv.com)'s free
  daily dump. Converted to AUD at 1.43, the rate the rest of the site uses. The file was current to 27 Sep 2026.
- **Licences:** I couldn't find a licence file in either repository. Check the terms before using this data commercially. TCGCSV asks
  for credit, and card names and artwork belong to their owners.
- **Cards have almost no prices.** Only the 168 cards the marketplace already prices (AUD, 21 Sep 2026) have a value; the other
  20,467 show "No price" until a price feed is connected or you enter one.
- **Sealed kinds are my classification.** The source doesn't say what kind a product is, so each one is sorted into a kind by its name
  (Booster box, Elite Trainer Box, Tin and so on). A few may be filed under the wrong kind. The source also mixes in loose cards
  (energy, tournament and promo cards); 591 of those were filtered out.
- **Some sealed prices are unreliable.** TCGplayer market prices on rarely traded items can be wildly off (one booster box case is
  listed at US$188,888.88). Sealed items priced at US$10,000 or more carry a **Check** tag. 688 sealed products have no price at all.
- **No images.**

Update the data to pick up new sets and prices (needs curl, Node and Python 3):

```bash
cd tools && npm install
bash fetch-catalog.sh     # cards: rebuilds data/catalog.js
bash fetch-sealed.sh      # sealed: rebuilds data/sealed.js
bash build-database.sh    # rebuilds everything in database/
```

### Loading your own sealed stock

Pick products from the sealed catalogue in the add form, or import a CSV with these columns (only `type` and `name` are required):
`type, name, set, number, card_id, tcgplayer_id, kind, print, pack_count, grade, cert, qty, market_aud, ask_aud, status, note`.
Use the **Download import template** button for the header row. Sealed rows match the catalogue by `tcgplayer_id`, or by exact name plus
an optional set; a name that fits several products is skipped with a note. Anything not in the catalogue is kept as your own hand-entered
product. Singles and slabs match by `card_id`, or by name plus set and/or number, and a name that fits several cards (say, "Pikachu")
is skipped with a note asking for a set or number. Rows that break a rule (a slab below PSA 8, a missing name, a non-numeric quantity)
are skipped and listed after the import.

### Prices for slabs

PSA 10 and PSA 9 use the marketplace multipliers (4.2x and 1.9x the raw price). PSA 8 is an estimate at 1.4x raw and should be checked
against real sales.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page shell, meta tags, font links |
| `css/styles.css` | All styling, with light and dark themes |
| `js/app.js` | Sample data, logic and the marketplace views |
| `js/db.js` | The product database: catalogue loading, rules, Database page, import and export |
| `data/catalog.js` | Every English card and set, loaded on demand |
| `data/sealed.js` | Sealed products with prices, loaded on demand |
| `js/boot.js` | Starts the app once everything has loaded |
| `database/`, `tools/` | Database files and the scripts that build them (not needed on the live site) |

## What is real and what is sample data

- The collectors, listings, stores, trade nights and conversations are built-in sample data.
- Your changes (offers, asking prices, trade nights joined, theme, database rows) are saved in the browser's `localStorage`, so they persist per browser and are not shared between users.
- Card faces are generated; `IMG` in `js/app.js` is where real artwork would be plugged in.
- Only 168 cards carry prices, plus 2,250 sealed products. Nothing is fetched live.
- To make it multi-user (accounts, shared listings, real messaging), the sample data would be replaced with calls to a backend API.
