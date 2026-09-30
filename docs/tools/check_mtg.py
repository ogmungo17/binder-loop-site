"""Checks ../data/mtg.js against the sources it was built from.

Usage : python3 check_mtg.py <pricelist.json> <sealed_pricelist.json> <AllPrintings.json.gz>   (the files build_mtg.py was given)
Exits 1 if anything that should always hold doesn't; prints the numbers behind every check.

Prices are checked by a different route from the build: the build matches Card Kingdom rows to printings by the Card Kingdom ids
MTGJSON records, and this matches them by the Scryfall id on each Card Kingdom row. A file price counts as confirmed when a
Card Kingdom row for the same Scryfall id and finish carries it.
"""
import collections, gzip, json, pathlib, re, sys

ck_file, cks_file, all_file = map(pathlib.Path, sys.argv[1:4])
DATA = pathlib.Path(__file__).resolve().parent.parent / "data" / "mtg.js"
text = DATA.read_text(encoding="utf-8")
assert text.startswith("window.__MTG=") and text.endswith(";\n")
d = json.loads(text[len("window.__MTG="):-2])
ck = json.loads(ck_file.read_text(encoding="utf-8"))["data"]
cks = json.loads(cks_file.read_text(encoding="utf-8"))["data"]
mj = json.load(gzip.open(all_file, "rt", encoding="utf-8"))["data"]

fails = []
def check(ok, what, detail=""):
    print(("ok   " if ok else "FAIL ") + what + (f"  {detail}" if detail else ""))
    if not ok: fails.append(what)
cents = lambda s: int(round(float(s) * 100))

# ---------------------------------------------------------------- shape
sets, cards, sealed = d["sets"], d["cards"], d["sealed"]
check(all(k in d for k in ("v", "built", "source", "sets", "names", "lines", "vars", "rar", "kinds", "cards", "sealed")), "top-level keys")
check(d["vars"][0] == "" and d["rar"][:4] == ["common", "uncommon", "rare", "mythic"], "vars[0] is empty, rarities start common..mythic")
check(len({s[0] for s in sets}) == len(sets), "set codes are unique", f"{len(sets)} sets")
check([s[3] for s in sets] == sorted(s[3] for s in sets), "sets are oldest first")
check(all(re.fullmatch(r"\d{4}-\d\d-\d\d", s[3]) for s in sets), "every set has a release date")
ok = True
for r in cards:
    s, n, nm, rar, ln, col, p = r[:7]
    b = r[7] if len(r) > 7 else [0, 0, 0]; v = r[8] if len(r) > 8 else 0
    ok &= (0 <= s < len(sets) and 0 <= nm < len(d["names"]) and 0 <= rar < len(d["rar"]) and 0 <= ln < len(d["lines"]) and 0 <= col < 32
           and 0 <= v < len(d["vars"]) and len(p) == 3 and len(b) == 3 and all(isinstance(x, int) and x >= 0 for x in p + b)
           and (isinstance(n, int) or isinstance(n, str)) and len(r) <= 9)
check(ok, "every card row is well formed (indexes in range, three whole-cent prices per array)")
check(len({(r[0], str(r[1])) for r in cards}) == len(cards), "set + collector number is unique", f"{len(cards)} printings")
check(len({r[0] for r in sealed}) == len(sealed) and all(len(r) == 6 and 0 <= r[2] < len(d["kinds"]) and -1 <= r[3] < len(sets) for r in sealed),
      "every sealed row is well formed with a unique id", f"{len(sealed)} products")
used_sets = {r[0] for r in cards} | {r[3] for r in sealed if r[3] >= 0}
check(used_sets == set(range(len(sets))), "every set in the table has a card or a product", f"{len(sets) - len(used_sets)} unused")

# ---------------------------------------------------------------- printings against MTGJSON
truth = {}
for code, s in mj.items():
    if s.get("isOnlineOnly"): continue
    groups = collections.defaultdict(list)
    for c in s.get("cards", []):
        if "paper" in (c.get("availability") or []): groups[c["number"]].append(c)
    for n, faces in groups.items(): truth[(code, n)] = faces
out = {(sets[r[0]][0], str(r[1])): r for r in cards}
check(set(out) == set(truth), "printings match MTGJSON's paper cards one to one", f"{len(out)} in file, {len(truth)} in MTGJSON")
bad = collections.Counter(); COL = {"W": 1, "U": 2, "B": 4, "R": 8, "G": 16}
for k, r in out.items():
    faces = truth[k]; f0 = sorted(faces, key=lambda c: c.get("side") or "")[0]
    sset = mj[k[0]]
    if d["names"][r[2]] != f0["name"]: bad["name"] += 1
    if d["rar"][r[3]] != f0["rarity"]: bad["rarity"] += 1
    if sets[r[0]][1] != sset["name"] or sets[r[0]][2] != sset["type"] or sets[r[0]][3] != sset["releaseDate"]: bad["set"] += 1
    m = 0
    for f in faces:
        for c in f.get("colors") or []: m |= COL[c]
    if r[5] != m: bad["colour"] += 1
    if not all(t in d["lines"][r[4]] for t in {f.get("type") for f in faces} if t): bad["type line"] += 1
check(not bad, "name, rarity, set, colours and type line agree with MTGJSON", dict(bad))

# ---------------------------------------------------------------- prices against Card Kingdom, by Scryfall id
by_scry = collections.defaultdict(list)
for r in ck:
    if r.get("scryfall_id"): by_scry[r["scryfall_id"]].append(r)
def finish_of(r): return 2 if "etched" in r["variation"].lower() else 1 if r["is_foil"] == "true" else 0
stat = collections.Counter(); unconf = []
for k, r in out.items():
    sids = {f["identifiers"].get("scryfallId") for f in truth[k]} - {None}
    rows = [x for s in sids for x in by_scry.get(s, [])]
    for i in range(3):
        for kind, val, field, qty in (("sell", r[6][i], "price_retail", None), ("buy", (r[7] if len(r) > 7 else [0, 0, 0])[i], "price_buy", "qty_buying")):
            if not val: continue
            same = [x for x in rows if finish_of(x) == i]
            if any(cents(x[field]) == val and (qty is None or x[qty] > 0) for x in same): stat[kind + " confirmed"] += 1
            elif not same: stat[kind + " no row by Scryfall id"] += 1; unconf.append((k, i, kind, val, "no row"))
            else: stat[kind + " differs"] += 1; unconf.append((k, i, kind, val, [cents(x[field]) for x in same]))
print("     price slots by the Scryfall route:", dict(stat))
check(stat["sell differs"] + stat["buy differs"] == 0, "no price in the file contradicts Card Kingdom's row for its Scryfall id and finish", f"{stat['sell differs'] + stat['buy differs']} differ")
print("     sample of slots with no Scryfall-route row:", unconf[:4])

# reverse: every non-token Card Kingdom row with a Scryfall id that a printing carries shows up as a price on that printing
inv = collections.defaultdict(list)
for k, faces in truth.items():
    for f in faces:
        s = f["identifiers"].get("scryfallId")
        if s: inv[s].append(k)
miss = collections.Counter(); seen = 0
for x in ck:
    ks = inv.get(x.get("scryfall_id"))
    if not ks: miss["row has no printing (token, art card or not in MTGJSON)"] += 1; continue
    seen += 1
    i = finish_of(x); price = cents(x["price_retail"])
    if not any(out[k][6][i] == price for k in set(ks)): miss["price not on any printing with that Scryfall id and finish (a second variant row)"] += 1
print("     Card Kingdom rows:", len(ck), "| with a printing:", seen, "|", dict(miss))
tok = sum(1 for x in ck if not inv.get(x.get("scryfall_id")) and (re.search(r"token|emblem", x["name"], re.I) or re.match(r"F?T[A-Z0-9]*-|CKT", x["sku"])))
other = [x for x in ck if not inv.get(x.get("scryfall_id")) and not (re.search(r"token|emblem", x["name"], re.I) or re.match(r"F?T[A-Z0-9]*-|CKT", x["sku"]))]
print(f"     not on a printing: {tok} tokens/emblems; {len(other)} others, by edition:", collections.Counter(x["edition"] for x in other).most_common(6))

# the buylist rule, and totals
slots = sum(1 for r in cards for x in (r[7] if len(r) > 7 else []) if x)
by_id = {x["id"]: x for x in ck}
claimed = set()
for k, faces in truth.items():
    for f in faces:
        for fld in ("cardKingdomId", "cardKingdomFoilId", "cardKingdomEtchedId"):
            v = f["identifiers"].get(fld)
            if v and int(v) in by_id: claimed.add(int(v))
print(f"     buylist prices in the file: {slots}; Card Kingdom rows by MTGJSON id with quantity wanted > 0: {sum(1 for i in claimed if by_id[i]['qty_buying'] > 0)}")
print(f"     printings with a price: {sum(1 for r in cards if any(r[6]))} of {len(cards)}")

# ---------------------------------------------------------------- sealed against Card Kingdom
ckmap = {x["id"]: x for x in cks}
ok = {r[0] for r in sealed} == set(ckmap)
check(ok, "sealed products are Card Kingdom's sealed list, one to one", f"{len(sealed)} in file, {len(ckmap)} listed")
wrong = sum(1 for r in sealed if r[1] != ckmap[r[0]]["name"].strip() or r[4] != cents(ckmap[r[0]]["price_retail"])
            or r[5] != (cents(ckmap[r[0]]["price_buy"]) if ckmap[r[0]]["qty_buying"] > 0 else 0))
check(wrong == 0, "sealed names and prices equal Card Kingdom's", f"{wrong} differ")
prod_set = {}
for code, s in mj.items():
    for p in s.get("sealedProduct", []):
        cid = (p.get("identifiers") or {}).get("cardKingdomId")
        if cid: prod_set[int(cid)] = code
wrong = [r for r in sealed if r[0] in prod_set and (r[3] < 0 or sets[r[3]][0] != prod_set[r[0]])]
check(not wrong, "sealed products sit in the set MTGJSON gives them", f"{sum(1 for r in sealed if r[0] in prod_set)} by MTGJSON, {sum(1 for r in sealed if r[3] >= 0 and r[0] not in prod_set)} by edition name, {sum(1 for r in sealed if r[3] < 0)} with no set")
print("     kinds:", dict(collections.Counter(d["kinds"][r[2]] for r in sealed)))

# ---------------------------------------------------------------- a few cards to read by eye
print("\nBy eye (file vs Card Kingdom's own rows, found by their sku, e.g. LEA-232 and FLEA-232):")
def show(code, name, num):
    r = out[(code, str(num))]; assert d["names"][r[2]] == name, (code, num, d["names"][r[2]])
    b = r[7] if len(r) > 7 else [0, 0, 0]
    raw = [(x["sku"], x["variation"], x["price_retail"], x["price_buy"], x["qty_buying"]) for x in ck if re.fullmatch(r"F?%s-0*%s" % (re.escape(code), re.escape(str(num))), x["sku"])]
    print(f"  {sets[r[0]][1]} #{r[1]} {name}: sell {r[6]} buy {b} label {d['vars'][r[8]] if len(r) > 8 else ''!r}\n      Card Kingdom: {raw}")
for a in (("LEA", "Black Lotus", 232), ("LTR", "The One Ring", 246), ("C21", "Sol Ring", 263), ("2XM", "Force of Will", 51), ("2XM", "Force of Will", 340), ("MH2", "Ragavan, Nimble Pilferer", 138)):
    try: show(*a)
    except KeyError: print("  (no printing", a, ")")
print("\n" + ("ALL CHECKS PASSED" if not fails else "FAILED: " + "; ".join(fails)))
sys.exit(1 if fails else 0)
