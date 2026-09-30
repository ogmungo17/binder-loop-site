"""Builds ../data/mtg.js: every paper Magic printing and the sealed product Card Kingdom lists, with Card Kingdom prices (USD cents).

Input : Card Kingdom's singles price list, its sealed price list, and MTGJSON's AllPrintings.json.gz (fetch-mtg.sh downloads all three)
Output: ../data/mtg.js, in the format written out at the top of ../js/mtg.js
Usage : python3 build_mtg.py <pricelist.json> <sealed_pricelist.json> <AllPrintings.json.gz>

Cards come from MTGJSON, one row per set and collector number (the faces of a double-faced, split or adventure card are one row).
Prices come from Card Kingdom and are matched to a printing by the Card Kingdom ids MTGJSON records for each finish (normal, foil,
etched); a Card Kingdom row MTGJSON has no id for is matched by its Scryfall id instead. A printing Card Kingdom doesn't list keeps
prices of 0. Tokens, art cards and helper cards aren't printings of a card and are left out.
Buylist: Card Kingdom's feed gives a buy price for almost every card, but with a quantity wanted of 0 for the ones it isn't
buying. Those aren't offers, so the buylist price is only kept while the quantity wanted is above 0.
Variation: the label Card Kingdom gives the printing (Borderless, Extended Art, Showcase...), which is what the site's alternate art
filter reads. It's taken from the normal-finish row, else the foil, else the etched, without the collector number Card Kingdom
leads some labels with ("0302 - Showcase") or the words that only name the finish (Foil Etched, Non-Foil, a lone Foil).
Sealed: every product on Card Kingdom's sealed list, given a set through MTGJSON's product record for the same Card Kingdom id (or by
matching Card Kingdom's edition name to a set), and a kind from its name.
"""
import collections, gzip, json, pathlib, re, sys

ck_file, cks_file, all_file = map(pathlib.Path, sys.argv[1:4])
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "mtg.js"

ck_meta, ck_rows = (lambda d: (d["meta"], d["data"]))(json.loads(ck_file.read_text(encoding="utf-8")))
cks_rows = json.loads(cks_file.read_text(encoding="utf-8"))["data"]
mj = json.load(gzip.open(all_file, "rt", encoding="utf-8"))
mj_meta, mj_sets = mj["meta"], mj["data"]
del mj

cents = lambda s: int(round(float(s) * 100))
ck_by_id = {r["id"]: r for r in ck_rows}
FINISH = ("cardKingdomId", "cardKingdomFoilId", "cardKingdomEtchedId")   # MTGJSON's Card Kingdom id fields: normal, foil, etched
COLOUR_BIT = {"W": 1, "U": 2, "B": 4, "R": 8, "G": 16}

def natural(n):
    return [(0, int(t), "") if t.isdigit() else (1, 0, t) for t in re.findall(r"\d+|\D+", n)]

def tidy_label(label):
    """Card Kingdom's variation label without its leading collector number ("0302 - Showcase") or the words that only name the finish (Foil Etched, Non-Foil, a lone Foil)."""
    s = re.sub(r"^\d+\s+-\s+(?=\S)", "", label)
    s = re.sub(r"\b(Foil Etched|Non-Foil)\b", "", s)
    s = re.sub(r"^\s*Foil\s*$", "", s)
    s = re.sub(r"\s+-\s+-\s+", " - ", s).strip(" -")
    return re.sub(r"\s{2,}", " ", s).strip()

# ---------------------------------------------------------------- printings
def printings(code, s):
    """One entry per collector number among a set's paper cards, the faces merged."""
    groups = collections.OrderedDict()
    for c in s.get("cards", []):
        if "paper" not in (c.get("availability") or []): continue
        groups.setdefault(c["number"], []).append(c)
    out = []
    for number, faces in groups.items():
        faces.sort(key=lambda c: c.get("side") or "")
        ids = [next((f["identifiers"].get(k) for f in faces if f["identifiers"].get(k)), None) for k in FINISH]
        lines = []
        for f in faces:
            if f.get("type") and f["type"] not in lines: lines.append(f["type"])
        mask = 0
        for f in faces:
            for col in f.get("colors") or []: mask |= COLOUR_BIT[col]
        out.append({"set": code, "number": number, "name": faces[0]["name"], "rarity": faces[0]["rarity"], "line": " // ".join(lines),
                    "col": mask, "ids": [int(i) if i else None for i in ids], "scry": {f["identifiers"].get("scryfallId") for f in faces} - {None}})
    return out

sets = {}
cards = []
for code, s in mj_sets.items():
    if s.get("isOnlineOnly"): continue
    ps = printings(code, s)
    if ps: sets[code] = s; cards += ps

# ---------------------------------------------------------------- prices
claimed = set()
for p in cards:
    p["retail"], p["buy"], p["rows"] = [0, 0, 0], [0, 0, 0], [None, None, None]
    for i, cid in enumerate(p["ids"]):
        r = ck_by_id.get(cid) if cid else None
        if r: p["rows"][i] = r; claimed.add(r["id"])

by_scry = collections.defaultdict(list)
for p in cards:
    for sid in p["scry"]: by_scry[sid].append(p)
by_scry_filled = 0
for r in ck_rows:
    if r["id"] in claimed or not r.get("scryfall_id"): continue
    hit = by_scry.get(r["scryfall_id"], [])
    if len(hit) != 1: continue
    i = 2 if "etched" in r["variation"].lower() else 1 if r["is_foil"] == "true" else 0
    if hit[0]["rows"][i] is None: hit[0]["rows"][i] = r; claimed.add(r["id"]); by_scry_filled += 1

for p in cards:
    for i, r in enumerate(p["rows"]):
        if not r: continue
        p["retail"][i] = cents(r["price_retail"])
        p["buy"][i] = cents(r["price_buy"]) if r["qty_buying"] > 0 else 0
    p["var"] = next((tidy_label(r["variation"]) for r in p["rows"] if r), "")

# ---------------------------------------------------------------- sealed
KINDS = ["Secret Lair drop", "Complete set", "Bulk lot", "Case", "Display", "Booster box", "Booster pack", "Bundle", "Prerelease pack",
         "Tournament pack", "Scene box", "Guild kit", "Draft night", "Gift box", "Box set", "Commander deck", "Planeswalker deck", "Theme deck",
         "Starter deck", "Deck", "Other"]
RULES = [
 ("Complete set",       r"complete (foil )?set|factory sealed"),
 ("Bulk lot",           r"^pure bulk|\bbulk\b"),
 ("Case",               r"\bcase\b"),
 ("Display",            r"\bdisplay\b"),
 ("Booster box",        r"booster box"),
 ("Prerelease pack",    r"pre-?release"),
 ("Tournament pack",    r"tournament pack"),
 ("Bundle",             r"\bbundle\b|fat pack"),
 ("Booster pack",       r"booster pack|\bbooster\b"),
 ("Scene box",          r"scene box"),
 ("Guild kit",          r"guild kit"),
 ("Draft night",        r"draft night"),
 ("Gift box",           r"gift"),
 ("Box set",            r"box[ -]?set|spellbook|collection|mythic edition|land station|team-up|clue edition|game night|global series"),
 ("Planeswalker deck",  r"planeswalker deck|duels of the planeswalkers"),
 ("Commander deck",     r"commander"),
 ("Theme deck",         r"theme deck"),
 ("Starter deck",       r"starter|intro pack|beginner|two-player|welcome"),
 ("Deck",               r"\bdecks?\b|game pack|archenemy|challenger|clash pack|brawl|planechase"),
]
def kind_of(r):
    if r["edition"] == "Secret Lair": return "Secret Lair drop"
    n = r["name"].lower()
    for k, rx in RULES:
        if re.search(rx, n): return k
    return "Other"

def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower().replace("&", "and").replace("’", "'"))
set_of_product = {}
for code, s in mj_sets.items():
    for p in s.get("sealedProduct", []):
        cid = (p.get("identifiers") or {}).get("cardKingdomId")
        if cid: set_of_product[int(cid)] = code
set_by_name = collections.defaultdict(list)
for code, s in mj_sets.items():
    if not s.get("isOnlineOnly"): set_by_name[norm(s["name"])].append(code)

sealed = []
for r in cks_rows:
    code = set_of_product.get(r["id"])
    if not code:
        hits = set_by_name.get(norm(r["edition"]), [])
        code = hits[0] if len(hits) == 1 else None
    sealed.append({"id": r["id"], "name": r["name"].strip(), "kind": kind_of(r), "set": code, "retail": cents(r["price_retail"]),
                   "buy": cents(r["price_buy"]) if r["qty_buying"] > 0 else 0})
assert len({x["id"] for x in sealed}) == len(sealed)
for x in sealed:                                          # a product's set has to be one the file carries
    if x["set"] and x["set"] not in sets: sets[x["set"]] = mj_sets[x["set"]]

# ---------------------------------------------------------------- tables
set_list = sorted(sets, key=lambda c: (sets[c]["releaseDate"], c))
set_idx = {c: i for i, c in enumerate(set_list)}
def table(values, first=()):
    t = list(first) + sorted({v for v in values} - set(first))
    return t, {v: i for i, v in enumerate(t)}
names, name_idx = table(p["name"] for p in cards)
lines, line_idx = table(p["line"] for p in cards)
vars_, var_idx = table((p["var"] for p in cards), first=("",))
rars, rar_idx = table((p["rarity"] for p in cards), first=("common", "uncommon", "rare", "mythic"))

def number(n): return int(n) if re.fullmatch(r"0|[1-9]\d*", n) else n
rows = []
for p in sorted(cards, key=lambda p: (set_idx[p["set"]], natural(p["number"]))):
    row = [set_idx[p["set"]], number(p["number"]), name_idx[p["name"]], rar_idx[p["rarity"]], line_idx[p["line"]], p["col"], p["retail"]]
    if any(p["buy"]) or p["var"]: row.append(p["buy"])
    if p["var"]: row.append(var_idx[p["var"]])
    rows.append(row)
seal_rows = [[x["id"], x["name"], KINDS.index(x["kind"]), set_idx[x["set"]] if x["set"] else -1, x["retail"], x["buy"]]
             for x in sorted(sealed, key=lambda x: (sets[x["set"]]["releaseDate"] if x["set"] else "0000", x["name"].lower(), x["id"]))]
assert len({(r[0], str(r[1])) for r in rows}) == len(rows)

out = {"v": 1, "built": ck_meta["created_at"][:10],
       "source": f"Card Kingdom price lists (api.cardkingdom.com) for prices in US cents; MTGJSON {mj_meta['version']} (mtgjson.com) for sets, cards and sealed product",
       "sets": [[c, sets[c]["name"], sets[c]["type"], sets[c]["releaseDate"]] for c in set_list], "names": names, "lines": lines, "vars": vars_,
       "rar": rars, "kinds": KINDS, "cards": rows, "sealed": seal_rows}
OUT.parent.mkdir(exist_ok=True)
OUT.write_text("window.__MTG=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")

# ---------------------------------------------------------------- report
priced = sum(1 for p in cards if any(p["retail"]))
print(f"{len(cards)} printings in {len(set_list)} sets ({priced} priced) and {len(sealed)} sealed products -> {OUT} ({OUT.stat().st_size/1024/1024:.1f} MB)")
print(f"prices from {ck_meta['created_at']} (Card Kingdom), cards from MTGJSON {mj_meta['version']}")
print(f"Card Kingdom singles rows used: {len(claimed)} of {len(ck_rows)} ({by_scry_filled} matched by Scryfall id); not used:",
      dict(collections.Counter("token" if re.search(r"token|emblem", r["name"], re.I) or re.match(r"F?T[A-Z0-9]*-|CKT", r["sku"]) else "other"
                               for r in ck_rows if r["id"] not in claimed)))
print("sealed by kind:", dict(collections.Counter(x["kind"] for x in sealed)), "| with a set:", sum(1 for x in sealed if x["set"]))
print("Other:", [x["name"] for x in sealed if x["kind"] == "Other"])
