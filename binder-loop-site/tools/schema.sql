-- Binder Loop product database.
-- Three product types share one table: single (raw card), sealed (booster boxes, ETBs, ...) and slab (PSA-graded).
-- Slabs are PSA only, and only at grades 10, 9 or 8. The database itself refuses anything else.
PRAGMA foreign_keys = ON;

CREATE TABLE sets (
  set_id      TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  series      TEXT NOT NULL,
  released    TEXT NOT NULL,                  -- YYYY-MM-DD
  total       INTEGER,
  ptcgo_code  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE products (
  product_id   TEXT PRIMARY KEY,
  type         TEXT NOT NULL CHECK (type IN ('single','sealed','slab')),
  name         TEXT NOT NULL CHECK (length(trim(name)) > 0),
  "set"        TEXT NOT NULL DEFAULT '',
  set_id       TEXT REFERENCES sets(set_id),  -- NULL for cards or products outside the catalogue
  number       TEXT NOT NULL DEFAULT '',      -- card number within the set, e.g. 4 or SV107
  series       TEXT NOT NULL DEFAULT '',
  released     TEXT NOT NULL DEFAULT '',
  supertype    TEXT NOT NULL DEFAULT '',      -- Pokémon / Trainer / Energy
  subtype      TEXT NOT NULL DEFAULT '',
  rarity       TEXT NOT NULL DEFAULT '',
  dex_no       INTEGER,
  card_id      TEXT,                          -- catalogue card id, e.g. base1-4. NULL for sealed and hand-entered cards
  tcgplayer_id INTEGER,                       -- TCGplayer product id for catalogue sealed product. NULL otherwise
  print        TEXT NOT NULL DEFAULT '',      -- Raw NM / Unlimited / Shadowless / 1st Edition
  sealed_kind  TEXT NOT NULL DEFAULT '',      -- sealed only
  pack_count   INTEGER CHECK (pack_count IS NULL OR pack_count >= 1),
  grader       TEXT NOT NULL DEFAULT '',      -- 'PSA' for slabs, empty otherwise
  grade        INTEGER,                       -- 10, 9 or 8 for slabs, NULL otherwise
  market_aud   REAL CHECK (market_aud IS NULL OR market_aud >= 0),
  value_basis  TEXT NOT NULL CHECK (value_basis IN ('market','multiplier','estimate','manual','unpriced')),
  flags        TEXT NOT NULL DEFAULT '',      -- data-quality notes, e.g. a print that never existed
  CHECK ((type = 'slab'  AND grader = 'PSA' AND grade IS NOT NULL AND grade IN (10, 9, 8))
      OR (type <> 'slab' AND grader = ''    AND grade IS NULL)),
  CHECK ((type = 'sealed' AND sealed_kind <> '')
      OR (type <> 'sealed' AND sealed_kind = '' AND pack_count IS NULL))
);

CREATE TABLE stock (
  stock_id    TEXT PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES products(product_id),
  owner_id    TEXT NOT NULL,
  owner_type  TEXT NOT NULL CHECK (owner_type IN ('me','collector','store')),
  owner_name  TEXT NOT NULL,
  suburb      TEXT,
  status      TEXT NOT NULL CHECK (status IN ('own','trade','sell')),   -- keeping / open to trade / for sale
  qty         INTEGER NOT NULL CHECK (qty >= 1),
  ask_aud     REAL CHECK (ask_aud IS NULL OR ask_aud >= 0),
  cert_number TEXT NOT NULL DEFAULT '' CHECK (cert_number = '' OR cert_number GLOB '[0-9][0-9][0-9][0-9][0-9]*'),
  note        TEXT NOT NULL DEFAULT '',
  source      TEXT NOT NULL CHECK (source IN ('sample','added'))
);

-- a PSA cert number only makes sense on a slab
CREATE TRIGGER stock_cert_only_on_slabs BEFORE INSERT ON stock
WHEN NEW.cert_number <> '' AND (SELECT type FROM products WHERE product_id = NEW.product_id) <> 'slab'
BEGIN SELECT RAISE(ABORT, 'cert_number is only for slabs'); END;

CREATE INDEX idx_products_type  ON products(type, grade);
CREATE INDEX idx_products_set   ON products(set_id, number);
CREATE INDEX idx_products_card  ON products(card_id);
CREATE INDEX idx_products_tcg   ON products(tcgplayer_id);
CREATE INDEX idx_products_name  ON products(name);
CREATE INDEX idx_stock_product  ON stock(product_id);
CREATE INDEX idx_stock_owner    ON stock(owner_type, owner_id);

-- one row per stock line with its product details: what the Database page shows
CREATE VIEW inventory AS
SELECT p.type, p.name, p."set", p.number, p.rarity, p.print, p.sealed_kind, p.pack_count, p.grade,
       s.qty, s.status, s.owner_name, s.owner_type, p.market_aud,
       p.market_aud * s.qty AS total_market_aud, s.ask_aud, s.cert_number,
       p.value_basis, p.flags, s.note, s.source, p.card_id, p.tcgplayer_id, p.product_id, s.stock_id
FROM stock s JOIN products p USING (product_id);

CREATE VIEW stock_by_type AS
SELECT p.type, p.grade, SUM(s.qty) AS units, ROUND(SUM(p.market_aud * s.qty), 2) AS market_aud
FROM stock s JOIN products p USING (product_id)
GROUP BY p.type, p.grade ORDER BY p.type, p.grade DESC;
