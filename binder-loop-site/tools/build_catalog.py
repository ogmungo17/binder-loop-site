"""Builds ../data/catalog.js: every English Pokémon TCG card, plus a link table to the marketplace's own 168 cards.

Input : a folder holding sets_en.json and cards/<set id>.json  (fetch-catalog.sh downloads them)
Output: ../data/catalog.js  (one script tag, works from file:// as well as over http)
Usage : python3 build_catalog.py <source folder> <legacy_cards.json>
"""
import glob, json, pathlib, re, sys, unicodedata, datetime

src = pathlib.Path(sys.argv[1]); legacy = json.loads(pathlib.Path(sys.argv[2]).read_text(encoding="utf-8"))
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "catalog.js"

sets = sorted(json.loads((src / "sets_en.json").read_text(encoding="utf-8")), key=lambda s: (s["releaseDate"], s["id"]))
set_idx = {s["id"]: i for i, s in enumerate(sets)}
cards = []
for s in sets:
    p = src / "cards" / (s["id"] + ".json")
    for c in json.loads(p.read_text(encoding="utf-8")):
        c["_set"] = s["id"]; cards.append(c)
assert len({c["id"] for c in cards}) == len(cards), "duplicate card ids"

# ---- lookup tables keep the file small
def table(values):
    seen = {}
    for v in values: seen.setdefault(v, len(seen))
    return seen
rar = table(c.get("rarity", "") for c in cards); sup = table(c["supertype"] for c in cards)
def number_key(n):
    m = re.match(r"^(\D*)(\d+)(.*)$", n); return (m.group(1), int(m.group(2)), m.group(3)) if m else (n, 0, "")
rows = []
for c in cards:
    dex = (c.get("nationalPokedexNumbers") or [0])[0]
    sub = (c.get("subtypes") or [""])[0]
    row = [set_idx[c["_set"]], c["number"], c["name"], rar[c.get("rarity", "")], sup[c["supertype"]], dex, sub]
    if c["id"] != c["_set"] + "-" + c["number"]: row.append(c["id"])      # a few cards share a printed number, so keep their real id
    rows.append(row)

# ---- link the marketplace's cards to catalogue ids
def norm(s): return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", s.replace("♀", "f").replace("♂", "m")).lower())
by_id = {c["id"]: c for c in cards}
by_name = {}
for c in cards: by_name.setdefault((c["_set"], norm(c["name"])), []).append(c)
VINT_SET = {"Base Set": "base1", "Jungle": "base2", "Fossil": "base3", "Black Star Promo": "basep"}
MODERN = {"umb":"swsh7-215","char":"swsh45sv-SV107","esp":"swsh8-270","ray":"swsh7-218","glac":"swsh7-209","gira":"swsh11-186",
  "lugia":"swsh12-186","sylv":"swsh7-212","gengar":"swsh8-271","pika":"swsh4-188","mew":"sm35-76","leaf":"swsh7-205",
  "jolt":"swsh7-51","flare":"swsh7-18","vapo":"swsh7-30","tyra":"swsh5-155","pidg":"swsh11-188"}
link, problems = {}, []
for l in legacy:
    k = l["k"]
    if not l["dex"]:
        cid = MODERN.get(k)
        if not cid or cid not in by_id or norm(by_id[cid]["name"]) != norm(l["n"]): problems.append(f"{k}: {l['n']} -> {cid} does not match")
        else: link[k] = cid
        continue
    sid = VINT_SET[l["set"]]; cand = by_name.get((sid, norm(l["n"])), [])
    if k == "g1_151": cand = [c for c in cand if c["id"] == "basep-8"]        # the original Mew promo
    elif l["rar"] == "Holo rare" and len(cand) > 1: cand = [c for c in cand if c.get("rarity") == "Rare Holo"]
    if len(cand) == 1: link[k] = cand[0]["id"]
    else: problems.append(f"{k}: {l['n']} ({l['set']}) matched {[c['id'] for c in cand]}")
assert not problems, problems
assert len(set(link.values())) == len(link), "two marketplace cards linked to the same catalogue card"

data = {
  "v": 1, "built": datetime.date.today().isoformat(), "count": len(rows),
  "source": "PokemonTCG/pokemon-tcg-data (English cards). No prices or images included.",
  "sets": [[s["id"], s["name"], s["series"], s["releaseDate"].replace("/", "-"), s["total"], s.get("ptcgoCode", "")] for s in sets],
  "rar": list(rar), "sup": list(sup), "cards": rows, "legacy": link,
}
OUT.parent.mkdir(exist_ok=True)
OUT.write_text("window.__CATALOG=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
print(f"{len(rows)} cards, {len(sets)} sets, {len(link)} marketplace cards linked -> {OUT} ({OUT.stat().st_size/1024:.0f} KB)")
