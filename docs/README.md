# Binder Loop

A standalone, static copy of the Binder Loop prototype: buy, sell and trade Pokémon cards with collectors near you.
Search and the listing flow are backed by a full card and sealed-product catalogue. No build step, no server code.

## Run it locally

Open `index.html` in a browser, or serve the folder (recommended):

```bash
cd binder-loop-site
python3 -m http.server 8080      # then visit http://localhost:8080
```

## Deploy it

After changing any file, bump the version number in `index.html` (`window.BL_V` and every `?v=` on the CSS and
script links) so browsers pick up the new files on a normal refresh instead of showing a cached copy.

Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3).
Routing is hash-based (`#/app/market/listings`), so no rewrite rules are needed.
The `database/` and `tools/` folders are not needed on the live site; leave them out if you like.

## Search and selling, backed by the full catalogue

There's no separate Database page any more. Instead, the catalogue (`data/catalog.js`, `data/sealed.js`) — every
English Pokémon TCG card (20,635 cards from 176 sets, Base Set in 1999 through 30th Celebration in September 2026)
plus 2,938 sealed products — is the data source behind two things:

- **Search** now spans the whole catalogue, not just the 168 cards the sample marketplace prices. Type a name, set or
  card number and you'll find anything, card or sealed product. Filter by kind (cards/sealed), set, card type, or
  price. The catalogue loads the first time you open Search or list an item (about 250 KB gzipped) and is cached
  after that.
- **Listing an item for sale** ("List an item" on the Selling tab) searches the same catalogue. Pick a card that's
  already in the sample marketplace and it works exactly as before. Pick anything else and, since it isn't in our
  price data, you're asked for a market value first — after that it behaves like any other card (its own price
  chart, "who has one" holders, want-list, everything), and it's remembered in this browser. Sealed product uses a
  simpler flow: quantity and an asking price, no grading or buyer-matching.

A few deliberate limits, given how much of the catalogue has no price at all (see below): the price filter only
matches items with a known price, and a sealed listing shows in Search and on your own Selling tab, but not yet in
the general Buy feed alongside card listings.

### Card filters

Every card search has the same filter bar, in `js/card-filters.js`: **Set**, **Holographic**, **Sealed**, **Graded** and
**Alternate art**. It's on Search, the Buy feed, "List an item", "Add a card" (binder and want list) and the "Looking
for something else?" search on a trade night. Each search remembers its own filters until the page reloads. Where a filter
can't apply it's greyed out with the reason on hover (a binder or a trade night can't hold sealed product, and sealed
listings aren't in the Buy feed yet). Some limits come from the data:

- **Holographic and alternate art are worked out, not recorded.** The catalogue has no holo or alt-art flag, so
  holo means any rarity above plain Common/Uncommon/Rare/Promo ("Rare Holo", "Rare Ultra", "Illustration Rare" and
  so on). Alt art means "Illustration Rare", "Special Illustration Rare" and Trainer Gallery cards, plus the
  marketplace cards marked "Alt art". Sword & Shield era alt arts outside the sample marketplace are filed under
  rarities like "Rare Secret", alongside ordinary full arts, so the filter misses them.
- **Graded means slightly different things by search.** On Search and trade nights it's a card someone nearby has in a
  PSA grade; on the Buy feed it's a listing in a PSA grade. When listing or adding a card it's a card that comes in PSA
  grades (vintage prints come as Unlimited, Shadowless or 1st Edition instead), and in "List an item" your own binder
  picks match only if your copy is graded.
- **Set** uses the catalogue's sets, so it waits for the catalogue to load. The Buy feed and trade nights offer only the
  sets that have cards there.

### As files (in `database/`)

The **files** are still there for anyone who wants the raw data outside the site, built by the scripts in `tools/`
straight from `data/catalog.js` and `data/sealed.js` — this is independent of the live site now:

| File | What it is |
| --- | --- |
| `binder-loop.db` | SQLite database (sets, products, and a `stock` table). The PSA 10/9/8 rule is enforced by the schema |
| `schema.sql` | The schema, including the `inventory` and `stock_by_type` views |
| `products.csv`, `sets.csv`, `stock.csv`, `inventory.csv` | Same data as CSV. Open straight in Excel |
| `binder-loop-database.json` | Everything in one JSON file, with the pricing metadata |

```bash
sqlite3 database/binder-loop.db "SELECT \"set\", number, rarity FROM products WHERE name='Charizard VMAX' AND type='single';"
sqlite3 database/binder-loop.db "SELECT * FROM stock_by_type;"
```

The `stock` table is a snapshot of the sample marketplace's own holdings taken when this export was last built
(`source = sample`) — it isn't connected to the site, and doesn't include anything you list through Search or
Selling. Re-run `build-database.sh` to refresh it from the current sample data.

### Where the data comes from, and its limits

- **Cards:** the [PokemonTCG/pokemon-tcg-data](https://github.com/PokemonTCG/pokemon-tcg-data) repository (English cards only). It now
  describes itself as a legacy project, so it may stop receiving updates. Japanese and other-language cards are not included.
- **Sealed product and its prices:** TCGplayer market prices in US dollars from
  [brentsharon/pokesave-data](https://github.com/brentsharon/pokesave-data), which repackages [TCGCSV](https://tcgcsv.com)'s free
  daily dump. Converted to AUD at 1.43, the rate the rest of the site uses. The file was current to 27 Sep 2026.
- **Licences:** I couldn't find a licence file in either repository. Check the terms before using this data commercially. TCGCSV asks
  for credit, and card names and artwork belong to their owners.
- **Cards have almost no prices.** Only the 168 cards the sample marketplace already prices (AUD, 21 Sep 2026) have a
  value until you list something else and set one yourself; the rest show "No price yet" in Search.
- **Elemental type** (Fire, Water, Darkness, Metal, and so on) is read from the source data and used for card art and
  the Type filter. Trainer and Energy cards, and anything the source doesn't type, have no elemental type and won't
  match a Type filter.
- **Sealed kinds are my classification.** The source doesn't say what kind a product is, so each one is sorted into a kind by its name
  (Booster box, Elite Trainer Box, Tin and so on). A few may be filed under the wrong kind. The source also mixes in loose cards
  (energy, tournament and promo cards); 591 of those were filtered out.
- **Some sealed prices are unreliable.** TCGplayer market prices on rarely traded items can be wildly off (one booster box case is
  listed at US$188,888.88). 688 sealed products have no price at all.
- **No images.** Card art is generated (name, set and a colour by type); `IMG` in `js/app.js` is where real artwork would plug in.

Update the data to pick up new sets and prices (needs curl, Node and Python 3):

```bash
cd tools && npm install
bash fetch-catalog.sh     # cards: rebuilds data/catalog.js
bash fetch-sealed.sh      # sealed: rebuilds data/sealed.js
bash build-database.sh    # rebuilds everything in database/
```

### Print variants and prices for graded cards

A vintage-eligible card (Base Set) offers Unlimited, Shadowless and 1st Edition; other early sets that had a 1st
Edition run but no Shadowless print offer Unlimited and 1st Edition only; everything else offers Raw, PSA 9 and PSA
10. PSA 10 and PSA 9 use the marketplace multipliers (4.2x and 1.9x the raw price); there's no PSA 8 tier any more.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page shell, meta tags, font links |
| `css/styles.css` | All styling, with light and dark themes |
| `js/app.js` | Sample data, core logic and the marketplace views |
| `js/db.js` | Catalogue loading (`CAT`, `SEAL`) and its lookup/search helpers |
| `js/market-search.js` | Search, the "list an item" flow, and turning a catalogue pick into a real listing |
| `data/catalog.js` | Every English card and set, loaded on demand |
| `data/sealed.js` | Sealed products with prices, loaded on demand |
| `js/boot.js` | Starts the app once everything has loaded |
| `database/`, `tools/` | Standalone data export and the scripts that build it (not needed on the live site) |

## Demo profiles

There are three logins for showing the site in a shop: **Jonah B** (Marrickville), **Ella M** (Newtown, vintage) and
**Chris L** (Parramatta, graded modern). Use **Log in** on the landing page, click your name in the app's top bar, or
**Switch profile** on the You page. There's no password. Each profile has its own binder, want list, listings, offers
and trade nights, saved separately in this browser, so switching never mixes them. **Reset demo data** in the same
dialog puts the signed-in profile back to its starting sample state before the next demo. Profiles are defined in
`PROFILES` at the top of `js/app.js`.

The three profiles can see each other. Signed in as one, the other two show up under Social, Collectors (tagged
"Demo login") with the binder and want list they last saved in this browser, so a change made as Jonah shows up
for Ella and Chris. Their listings appear in the Buy feed, and trades with them are suggested. The Collectors tab has a
search box that matches by name, suburb or what someone collects. Messages and offers aren't shared between profiles:
if Ella sends Jonah an offer, the reply is simulated, just as with the sample collectors.

## What is real and what is sample data

- The collectors, listings, stores, trade nights and conversations are built-in sample data.
- Your changes (offers, asking prices, trade nights joined, theme, cards and sealed items you've listed) are saved in the browser's `localStorage`, so they persist per browser and are not shared between users.
- Card faces are generated; `IMG` in `js/app.js` is where real artwork would be plugged in.
- Only 168 cards carry prices out of the box, plus 2,250 sealed products, until you set one yourself when listing something else. Nothing is fetched live.
- To make it multi-user (accounts, shared listings, real messaging), the sample data would be replaced with calls to a backend API.
