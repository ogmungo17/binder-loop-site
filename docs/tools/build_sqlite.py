"""Builds database/binder-loop.db and the CSV files from database/binder-loop-database.json.
Usage: python3 build_sqlite.py   (run export-data.js first)"""
import csv, json, sqlite3, pathlib

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "database"
data = json.loads((OUT / "binder-loop-database.json").read_text(encoding="utf-8"))

def num(v):
    return None if v in ("", None) else v

db_path = OUT / "binder-loop.db"
if db_path.exists():
    db_path.unlink()
con = sqlite3.connect(db_path)
con.executescript((HERE / "schema.sql").read_text(encoding="utf-8"))

con.executemany(
    "INSERT INTO sets (set_id,name,series,released,total,ptcgo_code) VALUES (?,?,?,?,?,?)",
    [(x["set_id"], x["name"], x["series"], x["released"], num(x["total"]), x["ptcgo_code"] or "") for x in data["sets"]])
con.executemany(
    'INSERT INTO products (product_id,type,name,"set",set_id,number,series,released,supertype,subtype,rarity,dex_no,card_id,tcgplayer_id,print,sealed_kind,pack_count,grader,grade,market_aud,value_basis,flags) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [(p["product_id"], p["type"], p["name"], p["set"], num(p["set_id"]), p["number"], p["series"], p["released"], p["supertype"], p["subtype"], p["rarity"],
      num(p["dex_no"]), num(p["card_id"]), num(p["tcgplayer_id"]), p["print"], p["sealed_kind"], num(p["pack_count"]), p["grader"], num(p["grade"]), num(p["market_aud"]), p["value_basis"], p["flags"])
     for p in data["products"]])
con.executemany(
    "INSERT INTO stock (stock_id,product_id,owner_id,owner_type,owner_name,suburb,status,qty,ask_aud,cert_number,note,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    [(s["stock_id"], s["product_id"], s["owner_id"], s["owner_type"], s["owner_name"], s["suburb"], s["status"], s["qty"],
      num(s["ask_aud"]), s["cert_number"], s["note"], s["source"]) for s in data["stock"]])
con.commit()

def dump(name, cols, rows):
    with open(OUT / name, "w", newline="", encoding="utf-8-sig") as f:     # BOM so Excel reads accents correctly
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

dump("sets.csv", list(data["sets"][0].keys()), data["sets"])
dump("products.csv", list(data["products"][0].keys()), data["products"])
dump("stock.csv", list(data["stock"][0].keys()), data["stock"])
dump("inventory.csv", list(data["inventory"][0].keys()), data["inventory"])
(OUT / "schema.sql").write_text((HERE / "schema.sql").read_text(encoding="utf-8"), encoding="utf-8")

print("sets:", con.execute("SELECT COUNT(*) FROM sets").fetchone()[0], "| products:", con.execute("SELECT COUNT(*) FROM products").fetchone()[0],
      "| stock lines:", con.execute("SELECT COUNT(*) FROM stock").fetchone()[0])
for row in con.execute("SELECT type, grade, units, market_aud FROM stock_by_type"):
    print("  ", row)
con.close()
