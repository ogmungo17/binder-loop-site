"""Builds ../data/sealed.js: sealed Pokémon TCG product with TCGplayer market prices (USD).

Input : sealed-prices.json from brentsharon/pokesave-data (fetch-sealed.sh downloads it) and the sets file used for the card catalogue
Output: ../data/sealed.js
Usage : python3 build_sealed.py <sealed-prices.json> <sets_en.json>

The source lists everything on TCGplayer without a collector number, which includes some loose cards (energy, promo and
tournament cards). Those are filtered out here by group and by name; products are then sorted into a kind by name.
"""
import collections, json, pathlib, re, sys

src, sets_file = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "sealed.js"
data = json.loads(src.read_text(encoding="utf-8")); products = data["products"]
sets = json.loads(sets_file.read_text(encoding="utf-8"))

# ---- kinds, first match wins
RULES = [
 ("Case",               r"\bcase\b"),
 ("Display",            r"\bdisplay\b"),
 ("Elite Trainer Box",  r"elite trainer box|\betb\b"),
 ("Booster box",        r"booster box"),
 ("Booster bundle",     r"booster bundle|art bundle|\bbundle\b"),
 ("Build & Battle box", r"build\s*(&|and)\s*battle"),
 ("Blister pack",       r"blister"),
 ("Tin",                r"\btins?\b"),
 ("Theme deck",         r"theme deck"),
 ("Deck",               r"battle deck|battle arena deck|league battle|starter deck|\bdeck\b(?!\s*box)|trainer kit|\bstarter\b"),
 ("Prerelease kit",     r"pre-?release kit|launch kit"),
 ("Booster pack",       r"booster pack|fun pack|sleeved booster|sampling pack"),
 ("Collection box",     r"collection|hanger box|\bbox\b|\bset\b|\bpin\b|\bposter\b|\bfigure\b|\bbinder\b|\balbum\b|\bplaymat\b|trading card game classic|collector'?s? chest|adventure chest|\bcalendar\b|toolkit|\bshowcase\b|battle academy|^my first battle \[|^play! pokemon prize pack series"),
 ("Other",              r"\bpack\b"),
]
KINDS = [k for k, _ in RULES]
CARD_GROUPS = {"Prize Pack Series Cards", "Jumbo Cards", "League & Championship Cards", "Deck Exclusives"}   # groups that are loose cards
def kind_of(name, group):
    n = name.lower()
    if group in CARD_GROUPS and not n.startswith("play! pokemon prize pack series"): return None   # that one is a sealed box
    if group == "World Championship Decks" and "world championship deck" not in n: return None     # the rest are single cards
    if re.search(r"\benergy\b", n) and not re.search(r"\b(box|tin|bundle|collection|case)\b", n): return None
    for k, rx in RULES:
        if re.search(rx, n): return k
    return None

# ---- groups -> catalogue sets
def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower().replace("&", "and").replace("’", "'"))
by_name = collections.defaultdict(list)
for s in sets: by_name[norm(s["name"])].append(s["id"])
def strip(g):
    g = re.sub(r"^(SWSH|SV|SM|XY|ME|BW|HGSS|DP|PL|EX|SS|POP|NP|BS)\d*[A-Z]*\s*[:\-]\s*", "", g)
    return re.sub(r"^(XY|SM|BW|HGSS|EX|DP|SS)\s*-\s*", "", g)
MANUAL = {"Base Set":"base1","Base Set (Shadowless)":"base1","SWSH01: Sword & Shield Base Set":"swsh1","SM Base Set":"sm1","XY Base Set":"xy1",
  "SV01: Scarlet & Violet Base Set":"sv1","SV: Scarlet & Violet 151":"sv3pt5","EX Ruby and Sapphire":"ex1","Expedition":"ecard1","HeartGold SoulSilver":"hgss1",
  "Triumphant":"hgss4","Undaunted":"hgss3","Unleashed":"hgss2","EX Delta Species":"ex11","EX Deoxys":"ex8","EX Dragon":"ex3","EX Dragon Frontiers":"ex15",
  "EX Emerald":"ex9","EX FireRed & LeafGreen":"ex6","EX Hidden Legends":"ex5","EX Holon Phantoms":"ex13","EX Legend Maker":"ex12","EX Power Keepers":"ex16",
  "EX Sandstorm":"ex2","EX Team Magma vs Team Aqua":"ex4","EX Team Rocket Returns":"ex7","EX Unseen Forces":"ex10","EX Crystal Guardians":"ex14"}
set_ids = {s["id"] for s in sets}
def set_of(group):
    sid = MANUAL.get(group)
    if not sid:
        hits = by_name.get(norm(strip(group)), [])
        sid = hits[0] if len(hits) == 1 else ""
    assert not sid or sid in set_ids, (group, sid)
    return sid
def group_text(group): return re.sub(r"^ME\d+\s*:\s*", "", group)      # keep the raw name for groups with no catalogue set

groups, gidx, rows, dropped = [], {}, [], collections.Counter()
for p in products:
    k = kind_of(p["name"], p["group"])
    if not k: dropped[p["group"]] += 1; continue
    if p["group"] not in gidx:
        gidx[p["group"]] = len(groups)
        sid = set_of(p["group"]); groups.append([sid, "" if sid else group_text(p["group"])])
    rows.append([p["id"], p["name"], KINDS.index(k), gidx[p["group"]], p["market"]])
rows.sort(key=lambda r: (r[3], r[1]))
assert len({r[0] for r in rows}) == len(rows)

out = {"v": 1, "built": data["updatedAt"][:10], "count": len(rows), "priced": sum(1 for r in rows if r[4] is not None),
       "source": "TCGplayer market prices in USD via TCGCSV, packaged daily by brentsharon/pokesave-data", "kinds": KINDS, "groups": groups, "rows": rows}
OUT.parent.mkdir(exist_ok=True)
OUT.write_text("window.__SEALED=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"{len(products)} in source -> {len(rows)} sealed products kept ({out['priced']} priced), {sum(dropped.values())} dropped as loose cards -> {OUT} ({OUT.stat().st_size/1024:.0f} KB)")
print("kinds:", dict(collections.Counter(KINDS[r[2]] for r in rows)))
print("matched to a catalogue set:", sum(1 for r in rows if groups[r[3]][0]), "| not matched:", sum(1 for r in rows if not groups[r[3]][0]))
print("dropped by group (top):", dropped.most_common(6))
