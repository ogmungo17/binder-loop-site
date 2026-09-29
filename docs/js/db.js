/* =====================================================================
   Product database: every English Pokémon TCG card, plus sealed product
   and PSA slabs. The card catalogue (data/catalog.js) loads the first time
   the Database page opens. Stock comes from the marketplace data and from
   anything added or imported here (saved in this browser). Loaded after app.js.
   ===================================================================== */
const DB_KEY = pkey("binderloop.db.v1");
const DB_TYPES = {single:"Single", sealed:"Sealed", slab:"Slab"};
const SLAB_GRADES = [10, 9, 8];                    // PSA 10 down to PSA 8, nothing lower
const GRADE_MULT = {10:4.2, 9:1.9, 8:1.4};         // PSA 10 and 9 match the marketplace; PSA 8 is an estimate
const GRADE_NAME = {10:"Gem Mint", 9:"Mint", 8:"NM-MT"};
const SEALED_KINDS = ["Booster pack","Booster bundle","Booster box","Elite Trainer Box","Build & Battle box","Collection box","Tin","Blister pack","Theme deck","Deck","Prerelease kit","Display","Case","Other"];
const DB_PRINTS = {raw:"Raw NM", unl:"Unlimited", shadow:"Shadowless", first:"1st Edition"};
const DB_STATUS = {own:"Keeping", trade:"Open to trade", sell:"For sale"};
const DB_BASIS = {market:"TCGplayer market price", multiplier:"Estimated from market with a print or grade multiplier",
  estimate:"Price estimate", manual:"Entered by hand", unpriced:"No price yet"};

const DB_PRODUCT_COLS = ["product_id","type","name","set","set_id","number","series","released","supertype","subtype","rarity","dex_no","card_id","tcgplayer_id","print","sealed_kind","pack_count","grader","grade","market_aud","value_basis","flags"];
const DB_STOCK_COLS = ["stock_id","product_id","owner_id","owner_type","owner_name","suburb","status","qty","ask_aud","cert_number","note","source"];
const DB_INV_COLS = ["type","name","set","number","rarity","print","sealed_kind","pack_count","grade","qty","status","owner_name","owner_type","market_aud","total_market_aud","ask_aud","cert_number","value_basis","flags","note","source","card_id","tcgplayer_id","product_id","stock_id"];
const DB_SET_COLS = ["set_id","name","series","released","total","ptcgo_code"];
const DB_IMPORT_COLS = ["type","name","set","number","card_id","tcgplayer_id","kind","print","pack_count","grade","cert","qty","market_aud","ask_aud","status","note"];

/* ---------- saved rows (everything added or imported by hand) ---------- */
let DBX = {items:[], seq:0};
function dbValid(it){
  if(!it || typeof it!=="object" || !DB_TYPES[it.type]) return false;
  if(typeof it.name!=="string" || !it.name.trim()) return false;
  if(it.type==="slab" && !SLAB_GRADES.includes(Number(it.grade))) return false;
  return true;
}
(function loadDb(){
  try{
    const s = JSON.parse(localStorage.getItem(DB_KEY)||"null");
    if(s && Array.isArray(s.items)){ DBX.items = s.items.filter(dbValid); DBX.seq = Math.max(Number(s.seq)||0, DBX.items.length); }
  }catch(e){}
})();
function saveDb(){ try{ localStorage.setItem(DB_KEY, JSON.stringify(DBX)); }catch(e){} }

/* ---------- the card catalogue ---------- */
const CAT = {state:"idle", cards:[], byId:new Map(), byName:new Map(), sets:[], setById:{}, setLookup:new Map(), legacy:{}, rev:{}, rar:[], sup:[], waiters:[], meta:{}};
const SEAL = {state:"none", items:[], byTid:new Map(), byName:new Map(), meta:{}};
const CAT_SETNAME = {base1:"Base Set"};            // the source calls this set just "Base"
const CAT_FIRST_ED = new Set(["base1","base2","base3","base5","gym1","gym2","neo1","neo2","neo3","neo4","ecard1","ecard2","ecard3"]);
const dbNorm = s => String(s).replace(/♀/g,"f").replace(/♂/g,"m").normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g,"");
const dbPad = n => String(n).replace(/\d+/g, m => m.padStart(4,"0"));

function sealInit(d){
  if(SEAL.state==="ready" || !d || !Array.isArray(d.rows)) return;
  SEAL.meta = {built:d.built, source:d.source, count:d.count, priced:d.priced};
  d.kinds.forEach(k => { if(!SEALED_KINDS.includes(k)) SEALED_KINDS.splice(SEALED_KINDS.length-1, 0, k); });
  SEAL.items = d.rows.map(r => {
    const g = d.groups[r[3]], set = g[0] ? CAT.setById[g[0]] : null, usd = r[4];
    const it = {tid:r[0], id:"P-"+r[0], name:r[1], kind:d.kinds[r[2]], setId:set?set.id:"", set:set?set.name:g[1], series:set?set.series:"", released:set?set.date:"",
      usd, aud:(usd==null) ? "" : Math.round(usd*PRICE_META.usdToAud*100)/100};
    it.hay = [it.name, it.set, it.setId, it.kind, it.series, "sealed"].join(" ").toLowerCase();
    it.nk = it.name.toLowerCase() + "|~";
    it.sk = set ? set.date + "|" + set.id + "|~" + it.name.toLowerCase() : "9999|" + it.name.toLowerCase();
    SEAL.byTid.set(it.tid, it);
    const nn = dbNorm(it.name); let arr = SEAL.byName.get(nn); if(!arr){ arr = []; SEAL.byName.set(nn, arr); } arr.push(it);
    return it;
  });
  SEAL.state = "ready";
}
function catInit(d){
  if(CAT.state==="ready" || !d || !Array.isArray(d.cards)) return;
  CAT.meta = {built:d.built, source:d.source, count:d.count};
  CAT.sets = d.sets.map((s,i) => ({i, id:s[0], name:CAT_SETNAME[s[0]]||s[1], series:s[2], date:s[3], year:Number(String(s[3]).slice(0,4)), total:s[4], code:s[5]||""}));
  const codes = {}; CAT.sets.forEach(s => { if(s.code) codes[s.code.toLowerCase()] = (codes[s.code.toLowerCase()]||0) + 1; });
  CAT.sets.forEach(s => {
    CAT.setById[s.id] = s; CAT.setLookup.set(s.name.toLowerCase(), s.id); CAT.setLookup.set(s.id.toLowerCase(), s.id);
    if(s.code && codes[s.code.toLowerCase()]===1) CAT.setLookup.set(s.code.toLowerCase(), s.id);
  });
  CAT.rar = d.rar; CAT.sup = d.sup; CAT.typ = d.typ || [""]; CAT.typeHue = d.type_hue || {}; CAT.legacy = d.legacy || {}; CAT.rev = {};
  Object.keys(CAT.legacy).forEach(k => { CAT.rev[CAT.legacy[k]] = k; });
  CAT.cards = d.cards.map(r => {
    const s = CAT.sets[r[0]], rarity = CAT.rar[r[3]] || "";
    const c = {id:r[8] || (s.id+"-"+r[1]), set:s, num:String(r[1]), name:r[2], rarity, sup:CAT.sup[r[4]], dex:r[5]||"", sub:r[6]||"", type:CAT.typ[r[7]]||"", val:0};
    c.hay = [c.name, s.name, s.id, s.code, c.num, rarity, c.sub, s.series, c.sup].join(" ").toLowerCase();
    c.nk = c.name.toLowerCase() + "|" + s.date + "|" + dbPad(c.num);
    c.sk = s.date + "|" + s.id + "|" + dbPad(c.num);
    CAT.byId.set(c.id, c);
    const nn = dbNorm(c.name); let arr = CAT.byName.get(nn); if(!arr){ arr = []; CAT.byName.set(nn, arr); } arr.push(c);
    return c;
  });
  CAT.state = "ready";
  CAT.cards.forEach(c => { if(CAT.rev[c.id]) c.val = dbCardValue(c, dbPrintsFor(c)[0], null) || 0; });
  sealInit(window.__SEALED);
  dbMigrate();
  CAT.waiters.splice(0).forEach(f => { try{ f(); }catch(e){} });
}
function catLoad(cb){
  if(CAT.state==="ready"){ if(cb) cb(); return; }
  if(cb && !CAT.waiters.includes(cb)) CAT.waiters.push(cb);
  if(CAT.state==="loading") return;
  if(window.__CATALOG){ catInit(window.__CATALOG); return; }
  CAT.state = "loading";
  const fail = () => { CAT.state = "error"; dbRerender(); };
  const add = (src, ok, bad) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => { s.remove(); bad(); }; document.head.appendChild(s); };
  // cards first; the sealed list is optional, so the page still works without it
  add("data/catalog.js", () => { if(!window.__CATALOG) return fail(); const go = () => catInit(window.__CATALOG); if(window.__SEALED) go(); else add("data/sealed.js", go, go); }, fail);
}
function dbRerender(){ if(typeof S!=="undefined" && S.view==="app" && S.page==="db") render(); }
function dbRetryCatalog(){ CAT.state = "idle"; render(); }
// rows saved by an earlier build used marketplace keys instead of catalogue ids
function dbMigrate(){
  let changed = false;
  DBX.items.forEach(it => {
    if(it.card && !CAT.byId.has(it.card)){ it.card = CAT.legacy[it.card] || ""; changed = true; }
    if(it.card && it.type==="sealed"){ it.card = ""; changed = true; }
  });
  if(changed) saveDb();
}
const catSetId = text => text ? (CAT.setLookup.get(String(text).trim().toLowerCase()) || "") : "";

/* ---------- card and product helpers ---------- */
function dbPrintsFor(c){
  if(c.set.id==="base1") return ["unl","shadow","first"];
  if(CAT_FIRST_ED.has(c.set.id)) return ["unl","first"];
  return ["raw"];
}
const dbBaseId = c => "S-" + c.id + "-" + dbPrintsFor(c)[0];
function dbCardValue(c, print, grade){
  const k = CAT.rev[c.id]; if(!k) return "";
  return Math.round(CARDS[k].v * vOf(k, print).mult * (grade ? GRADE_MULT[grade] : 1));
}
function dbCardBasis(c, print, grade){
  const k = CAT.rev[c.id]; if(!k) return "unpriced";
  if(grade || (print!=="raw" && print!=="unl")) return "multiplier";
  return /price estimate/.test(CARDS[k].s) ? "estimate" : "market";
}
function dbFlags(c, print){
  const out = [];
  if(print==="shadow" && c.set.id!=="base1") out.push("Shadowless is a Base Set print only");
  if(print==="first" && !CAT_FIRST_ED.has(c.set.id)) out.push("No 1st Edition print of this card");
  return out.join("; ");
}
function dbCardProduct(c, print, grade){
  const val = dbCardValue(c, print, grade);
  return {product_id:(grade?"G-":"S-")+c.id+"-"+print+(grade?"-PSA"+grade:""), type:grade?"slab":"single",
    name:c.name, set:c.set.name, set_id:c.set.id, number:c.num, series:c.set.series, released:c.set.date, supertype:c.sup, subtype:c.sub,
    rarity:c.rarity, dex_no:c.dex, card_id:c.id, tcgplayer_id:"", print:(grade && print==="raw")?"":DB_PRINTS[print], print_id:print,
    sealed_kind:"", pack_count:"", grader:grade?"PSA":"", grade:grade||"",
    market_aud:val, value_basis:val===""?"unpriced":dbCardBasis(c,print,grade), flags:dbFlags(c,print)};
}
function dbCustomProduct(it){
  const t = it.type, hasMk = !(it.market==null || it.market==="");
  const key = [t, it.name.trim().toLowerCase(), (it.set||"").trim().toLowerCase(), t==="sealed"?it.kind:"", t==="slab"?it.grade:"", t==="single"?(it.print||""):""].join("|");
  return {product_id:"U-"+hsh(key).toString(36), type:t, name:it.name.trim(), set:(it.set||"").trim(), set_id:catSetId(it.set), number:"", series:"", released:"",
    supertype:"", subtype:"", rarity:"", dex_no:"", card_id:"", tcgplayer_id:"",
    print:(t==="single" && it.print) ? (DB_PRINTS[it.print]||"") : "", print_id:it.print||"",
    sealed_kind:t==="sealed" ? (it.kind||"Other") : "", pack_count:(t==="sealed" && it.packs) ? Number(it.packs) : "",
    grader:t==="slab"?"PSA":"", grade:t==="slab"?Number(it.grade):"",
    market_aud:hasMk?Number(it.market):"", value_basis:hasMk?"manual":"unpriced", flags:""};
}
const DB_HIGH_USD = 10000;
function dbSealedProduct(x){
  return {product_id:x.id, type:"sealed", name:x.name, set:x.set, set_id:x.setId, number:"", series:x.series, released:x.released, supertype:"", subtype:"", rarity:"", dex_no:"",
    card_id:"", tcgplayer_id:x.tid, print:"", print_id:"", sealed_kind:x.kind, pack_count:"", grader:"", grade:"",
    market_aud:x.aud, value_basis:x.aud===""?"unpriced":"market",
    flags:(x.usd!=null && x.usd>=DB_HIGH_USD) ? "Very high price. TCGplayer market prices on thin listings can be unreliable, so verify it before relying on it" : ""};
}
function dbItemProduct(it){
  if(it.type==="sealed" && it.sid && SEAL.byTid.has(Number(it.sid))) return dbSealedProduct(SEAL.byTid.get(Number(it.sid)));
  const grade = it.type==="slab" ? Number(it.grade) : null;
  const c = (it.type!=="sealed" && it.card) ? CAT.byId.get(it.card) : null;
  if(c){ const pr = dbPrintsFor(c); return dbCardProduct(c, pr.includes(it.print) ? it.print : pr[0], grade); }
  return dbCustomProduct(it);
}
function dbProductById(id, D){
  const held = D && D.products.find(p => p.product_id===id); if(held) return held;
  const sp = /^P-(\d+)$/.exec(id); if(sp && SEAL.byTid.has(Number(sp[1]))) return dbSealedProduct(SEAL.byTid.get(Number(sp[1])));
  const m = /^([SG])-(.+?)-(raw|unl|shadow|first)(?:-PSA(\d+))?$/.exec(id);
  if(m){ const c = CAT.byId.get(m[2]); if(c) return dbCardProduct(c, m[3], m[1]==="G" ? Number(m[4]) : null); }
  return null;
}
function dbOwner(id){
  if(!id || id==="me") return {id:"me", type:"me", name:me.name, suburb:me.suburb};
  const p = findParty(id);
  return p ? {id:p.id, type:p.store?"store":"collector", name:p.name, suburb:p.suburb} : {id:"me", type:"me", name:me.name, suburb:me.suburb};
}

/* ---------- stock: marketplace holdings plus rows added by hand ---------- */
function dbBuild(){
  const products = new Map(), stock = [];
  const put = p => { if(!products.has(p.product_id)) products.set(p.product_id, p); return products.get(p.product_id); };

  // holdings already in the marketplace data. PSA 9 / PSA 10 "printings" become slabs here.
  const lst = {}; listings().forEach(l => { lst[l.id] = l.price; });
  [["me", me]].concat(USERS.map(u=>[u.id,u]), STORES.map(s=>[s.id,s])).forEach(([oid,p]) => {
    Object.keys(p.cards).forEach(k => {
      const c = CAT.byId.get(CAT.legacy[k]); if(!c) return;
      const v = (p.vars && p.vars[k]) || variantsFor(k)[0].id, m = /^psa(\d+)$/.exec(v);
      const grade = m ? Number(m[1]) : null, print = m ? dbPrintsFor(c)[0] : v;
      if(grade!==null && !SLAB_GRADES.includes(grade)) return;      // slabs only exist at PSA 10, 9 and 8
      const prod = put(dbCardProduct(c, print, grade)), st = p.cards[k];
      const ask = st!=="sell" ? "" : (oid==="me" ? askOf(k) : (lst[oid+"|"+k]!=null ? lst[oid+"|"+k] : ""));
      const note = (grade!==null && CARDS[k].dex) ? "Marketplace still prices this vintage card as ungraded" : "";
      stock.push({stock_id:"M-"+oid+"-"+k, product_id:prod.product_id, owner_id:oid, status:st, qty:1, ask_aud:ask, cert_number:"", note, source:"sample"});
    });
  });

  // rows added or imported by hand
  DBX.items.forEach(it => {
    const prod = put(dbItemProduct(it)), hasMk = !(it.market==null || it.market==="");
    if(hasMk && (prod.value_basis==="unpriced" || prod.value_basis==="manual")){ prod.market_aud = Number(it.market); prod.value_basis = "manual"; }
    stock.push({stock_id:it.id, product_id:prod.product_id, owner_id:it.owner||"me", status:DB_STATUS[it.status]?it.status:"own",
      qty:Math.max(1, parseInt(it.qty,10)||1), ask_aud:(it.ask==null||it.ask==="")?"":Number(it.ask), cert_number:it.cert||"", note:it.note||"", source:"added"});
  });

  const rows = stock.map(s => {
    const p = products.get(s.product_id), o = dbOwner(s.owner_id);
    return Object.assign({}, p, s, {owner_type:o.type, owner_name:o.name, suburb:o.suburb, total_market_aud:p.market_aud===""?"":p.market_aud*s.qty});
  });
  return {products:[...products.values()], stock:stock.map(s=>{ const o=dbOwner(s.owner_id); return Object.assign({}, s, {owner_type:o.type, owner_name:o.name, suburb:o.suburb}); }), rows};
}
// every card in the catalogue (in its base print) plus everything held, one row per product
function dbAllProducts(D){
  const map = new Map();
  CAT.cards.forEach(c => { const p = dbCardProduct(c, dbPrintsFor(c)[0], null); map.set(p.product_id, p); });
  SEAL.items.forEach(x => { const p = dbSealedProduct(x); map.set(p.product_id, p); });
  D.products.forEach(p => map.set(p.product_id, p));
  return [...map.values()];
}
function dbExportData(){
  const D = dbBuild(), cut = (o,cols) => Object.fromEntries(cols.map(c=>[c,o[c]]));
  return {
    meta:{exported:new Date().toISOString(), currency:"AUD", price_source:PRICE_META.source, prices_as_of:PRICE_META.asOf, usd_to_aud:PRICE_META.usdToAud,
      product_types:Object.keys(DB_TYPES), slab_grader:"PSA", slab_grades:SLAB_GRADES, grade_multipliers:GRADE_MULT,
      catalogue:{source:CAT.meta.source, built:CAT.meta.built, cards:CAT.cards.length, sets:CAT.sets.length, priced_cards:Object.keys(CAT.legacy).length,
      sealed_products:SEAL.items.length, priced_sealed:SEAL.items.filter(x=>x.aud!=="").length, sealed_source:SEAL.meta.source, sealed_prices_as_of:SEAL.meta.built}},
    sets:CAT.sets.map(s => ({set_id:s.id, name:s.name, series:s.series, released:s.date, total:s.total, ptcgo_code:s.code})),
    products:dbAllProducts(D).map(p=>cut(p,DB_PRODUCT_COLS)),
    stock:D.stock.map(s=>cut(s,DB_STOCK_COLS)),
    inventory:D.rows.map(r=>cut(r,DB_INV_COLS))
  };
}

/* ---------- filters, aggregation, stats ---------- */
const DBF = {type:"all", grade:"all", q:"", owner:"all", sort:"name", stockOnly:false, flagged:false, set:"all", rarity:"all", sup:"all", kind:"all", page:0};
const DB_PAGE = 50, DB_EMPTY = {qty:0, holders:new Set(), lines:0};
function dbF(k, v){ DBF[k] = v; DBF.page = 0; render(); }
function dbAgg(D, ownerF){
  const by = {};
  D.rows.forEach(r => {
    if(ownerF!=="all" && r.owner_type!==ownerF) return;
    const a = by[r.product_id] || (by[r.product_id] = {qty:0, holders:new Set(), lines:0});
    a.qty += r.qty; a.holders.add(r.owner_id); a.lines++;
  });
  return by;
}
const dbHay = p => [p.name,p.set,p.set_id,p.number,p.print,p.sealed_kind,p.rarity,p.series,p.supertype,p.subtype,p.grade?"psa "+p.grade:"",p.dex_no,DB_TYPES[p.type]].join(" ").toLowerCase();
const dbCmp = (x,y) => x<y ? -1 : x>y ? 1 : 0;
function dbEntries(D){
  const by = dbAgg(D, DBF.owner), words = DBF.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const held = new Set(D.products.map(p=>p.product_id)), typeOK = t => DBF.type==="all" || DBF.type===t;
  const cardOK = (setId, rarity, sup) => (DBF.set==="all" || setId===DBF.set) && (DBF.rarity==="all" || rarity===DBF.rarity) && (DBF.sup==="all" || sup===DBF.sup);
  const sealedOK = (setId, kind) => (DBF.set==="all" || setId===DBF.set) && (DBF.kind==="all" || kind===DBF.kind) && DBF.rarity==="all" && DBF.sup==="all";
  const out = [];
  D.products.forEach(p => {
    if(!typeOK(p.type)) return;
    if(p.type==="slab" && DBF.grade!=="all" && String(p.grade)!==String(DBF.grade)) return;
    const a = by[p.product_id];
    if((DBF.stockOnly || DBF.owner!=="all") && !a) return;
    if(DBF.flagged && !p.flags) return;
    if(p.type==="sealed"){ if(!sealedOK(p.set_id, p.sealed_kind)) return; }
    else if(!cardOK(p.set_id, p.rarity, p.supertype)) return;
    if(words.length && !words.every(w => dbHay(p).includes(w))) return;
    out.push({p, c:CAT.byId.get(p.card_id)||null, s:null, a:a||DB_EMPTY});
  });
  if(typeOK("single") && !DBF.stockOnly && DBF.owner==="all" && !DBF.flagged){
    for(const c of CAT.cards){
      if(!cardOK(c.set.id, c.rarity, c.sup)) continue;
      if(words.length && !words.every(w => c.hay.includes(w))) continue;
      if(held.has(dbBaseId(c))) continue;
      out.push({p:null, c, s:null, a:DB_EMPTY});
    }
  }
  if(typeOK("sealed") && !DBF.stockOnly && DBF.owner==="all" && !DBF.flagged){
    for(const x of SEAL.items){
      if(!sealedOK(x.setId, x.kind)) continue;
      if(words.length && !words.every(w => x.hay.includes(w))) continue;
      if(held.has(x.id)) continue;
      out.push({p:null, c:null, s:x, a:DB_EMPTY});
    }
  }
  out.forEach(e => {
    e.nk = (e.c ? e.c.nk : e.s ? e.s.nk : e.p.name.toLowerCase()+"|") + "|" + (e.p ? e.p.product_id : "");
    e.sk = e.c ? e.c.sk : e.s ? e.s.sk : (e.p.released ? e.p.released + "|" + (e.p.set_id||"") + "|~" + e.p.name.toLowerCase() : "9999|" + e.p.name.toLowerCase());
    e.unk = e.sk.startsWith("9999") ? 1 : 0;                  // products with no set sort last both ways
    e.val = e.p ? (Number(e.p.market_aud)||0) : e.s ? (Number(e.s.aud)||0) : (e.c.val||0);
  });
  const sorts = {name:(x,y)=>dbCmp(x.nk,y.nk), value:(x,y)=>(y.val-x.val)||dbCmp(x.nk,y.nk), stock:(x,y)=>(y.a.qty-x.a.qty)||dbCmp(x.nk,y.nk),
    set:(x,y)=>(x.unk-y.unk)||dbCmp(x.sk,y.sk)||dbCmp(x.nk,y.nk), new:(x,y)=>(x.unk-y.unk)||dbCmp(y.sk,x.sk)||dbCmp(x.nk,y.nk)};
  return out.sort(sorts[DBF.sort]||sorts.name);
}
function dbStats(D){
  const s = {single:{u:0,v:0,cat:CAT.cards.length}, sealed:{u:0,v:0,cat:SEAL.items.length}, slab:{u:0,v:0,cat:0,g:{10:0,9:0,8:0}}};
  let unpriced = 0, flagged = 0, total = 0;
  D.products.forEach(p => {
    const c = p.card_id && CAT.byId.get(p.card_id);
    if(p.type==="single" && c && p.product_id===dbBaseId(c)) return;    // already counted in the catalogue
    if(p.type==="sealed" && /^P-/.test(p.product_id)) return;
    s[p.type].cat++;
  });
  D.rows.forEach(r => {
    const t = s[r.type]; t.u += r.qty;
    if(r.market_aud==="") unpriced += r.qty; else { t.v += r.market_aud*r.qty; total += r.market_aud*r.qty; }
    if(r.type==="slab") t.g[r.grade] += r.qty;
    if(r.flags) flagged++;
  });
  return {s, unpriced, flagged, total};
}

/* ---------- the Database page ---------- */
const dbIc = (n,sz) => ICON[n] ? ic(n,sz) : "";
ICON.db = '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>';
const dbSpec = p => p.type==="slab"
  ? `<span class="vchip psa${p.grade}" style="margin:0">PSA ${p.grade}</span> <span class="muted">${GRADE_NAME[p.grade]}${p.print?" · "+esc(p.print):""}</span>`
  : p.type==="sealed" ? esc(p.sealed_kind)+(p.pack_count?` <span class="muted">· ${p.pack_count} packs</span>`:"") : esc(p.print||"");
const dbN = n => Number(n).toLocaleString("en-AU");

function dbSetOptions(cur){
  const bySeries = new Map();
  CAT.sets.forEach(s => { if(!bySeries.has(s.series)) bySeries.set(s.series, []); bySeries.get(s.series).push(s); });
  const groups = [...bySeries.entries()].map(([name, list]) => ({name, list:list.slice().sort((a,b)=>dbCmp(b.date,a.date)), latest:list.reduce((m,s)=>s.date>m?s.date:m,"")}))
    .sort((a,b)=>dbCmp(b.latest,a.latest));
  return `<option value="all">All sets</option>` + groups.map(g => `<optgroup label="${esc(g.name)}">${g.list.map(s=>`<option value="${esc(s.id)}"${cur===s.id?" selected":""}>${esc(s.name)} (${s.year})</option>`).join("")}</optgroup>`).join("");
}

function dbPage(){
  if(CAT.state!=="ready"){
    if(CAT.state==="error") return pageHead("Database","Every English Pokémon card, plus your sealed product and graded slabs.") +
      emptyBox("Couldn't load the card catalogue","The file data/catalog.js wasn't found. Keep the data folder next to index.html, and serve the site over http if your browser blocks local files.",`<button class="btn primary" onclick="dbRetryCatalog()">Try again</button>`);
    catLoad(dbRerender);
    return pageHead("Database","Every English Pokémon card, plus your sealed product and graded slabs.") +
      `<div class="empty" role="status"><b>Loading the card catalogue…</b><p>About 20,000 cards. This only happens the first time.</p></div>`;
  }
  const D = dbBuild(), all = dbEntries(D), st = dbStats(D), S = st.s;
  const pages = Math.max(1, Math.ceil(all.length / DB_PAGE)); DBF.page = Math.min(Math.max(0, DBF.page), pages - 1);
  const shown = all.slice(DBF.page*DB_PAGE, DBF.page*DB_PAGE + DB_PAGE);
  const stat = (n,l,sub) => `<div class="stat"><b>${n}</b><span>${l}</span>${sub?`<span class="muted" style="font-size:12.5px">${sub}</span>`:""}</div>`;
  const stats = `<div class="stats" role="group" aria-label="Database totals">
    ${stat(dbN(S.single.u),"Singles in stock",dbN(S.single.cat)+" in the catalogue")}
    ${stat(dbN(S.sealed.u),"Sealed in stock",S.sealed.cat?dbN(S.sealed.cat)+" in the catalogue":"None loaded yet")}
    ${stat(dbN(S.slab.u),"Slabs in stock","PSA 10: "+S.slab.g[10]+" · 9: "+S.slab.g[9]+" · 8: "+S.slab.g[8])}
    ${stat(money(Math.round(st.total)),"Stock at market",st.unpriced?plural(st.unpriced,"item")+" unpriced":"AUD")}</div>`;
  const warn = st.flagged ? `<div class="dbwarn"><span><b>${plural(st.flagged,"holding")} to check.</b> Some are prints that never existed for that card (for example Shadowless Jungle or Fossil cards), or prices that look unreliable. They carry a <span class="vchip warn" style="margin:0">Check</span> tag.</span>
    <button class="btn sm${DBF.flagged?" on":""}" aria-pressed="${DBF.flagged}" onclick="dbF('flagged',${!DBF.flagged})">${DBF.flagged?"Show everything":"Show only these"}</button></div>` : "";
  const seg = ([["all","All"],["single","Singles"],["sealed","Sealed"],["slab","Slabs"]]).map(([id,l])=>`<button class="${DBF.type===id?"on":""}" aria-pressed="${DBF.type===id}" onclick="dbSetType('${id}')">${l}</button>`).join("");
  const grades = DBF.type==="slab" ? `<div class="chips-l" role="group" aria-label="PSA grade">${[["all","Any grade"]].concat(SLAB_GRADES.map(g=>[String(g),"PSA "+g])).map(([id,l])=>`<button class="chip" aria-pressed="${String(DBF.grade)===id}" onclick="dbF('grade','${id}')">${l}</button>`).join("")}</div>` : "";
  const opts = (arr,cur) => arr.map(([v,l])=>`<option value="${esc(v)}"${cur===v?" selected":""}>${esc(l)}</option>`).join("");
  const rarOpts = [["all","Any rarity"]].concat(CAT.rar.filter(Boolean).slice().sort().map(r=>[r,r]));
  const supOpts = [["all","Any card type"]].concat(CAT.sup.map(x=>[x,x]));
  const bar = `<div class="dbbar"><div class="segc" role="group" aria-label="Product type">${seg}</div>${grades}
    <div class="dbq">${dbIc("search",16)}<input id="dbq" data-keep type="search" value="${esc(DBF.q)}" placeholder="Search name, set, card number, product or grade" autocomplete="off" aria-label="Search the database" oninput="DBF.q=this.value;DBF.page=0;render()"></div>
    <select class="dbsel" aria-label="Held by" onchange="dbF('owner',this.value)">${opts([["all","All holders"],["me","You"],["store","Stores"],["collector","Collectors"]],DBF.owner)}</select>
    <select class="dbsel" aria-label="Sort" onchange="dbF('sort',this.value)">${opts([["name","Name A–Z"],["new","Newest set first"],["set","Oldest set first"],["value","Value, high to low"],["stock","Most in stock"]],DBF.sort)}</select>
    <button class="chip" aria-pressed="${DBF.stockOnly}" onclick="dbF('stockOnly',${!DBF.stockOnly})">In stock only</button></div>
    <div class="dbbar dbfilters"><select class="dbsel" aria-label="Set" onchange="dbF('set',this.value)">${dbSetOptions(DBF.set)}</select>
    ${DBF.type==="sealed" ? `<select class="dbsel" aria-label="Kind of product" onchange="dbF('kind',this.value)">${opts([["all","Any kind"]].concat(SEALED_KINDS.map(k=>[k,k])),DBF.kind)}</select>` : `<select class="dbsel" aria-label="Rarity" onchange="dbF('rarity',this.value)">${opts(rarOpts,DBF.rarity)}</select>
    <select class="dbsel" aria-label="Card type" onchange="dbF('sup',this.value)">${opts(supOpts,DBF.sup)}</select>`}
    ${(DBF.set!=="all"||DBF.rarity!=="all"||DBF.sup!=="all"||DBF.kind!=="all"||DBF.q||DBF.stockOnly||DBF.owner!=="all"||DBF.flagged||DBF.grade!=="all") ? `<button class="link" onclick="dbClearFilters()">Clear filters</button>` : ""}</div>`;

  let body;
  if(!all.length){
    const noSealed = DBF.type==="sealed" && !DBF.q && DBF.set==="all" && !S.sealed.cat;
    body = noSealed
      ? emptyBox("No sealed product yet","Add sealed stock one line at a time, or import a CSV of your stock list.",`<div class="hero-cta" style="justify-content:center;margin-top:12px"><button class="btn primary" onclick="dbOpenForm()">Add sealed product</button><button class="btn" onclick="dbImportPick()">Import CSV</button></div>`)
      : emptyBox("Nothing matches those filters","Try a different search, or clear a filter.",`<button class="btn" onclick="dbClearFilters()" style="margin-top:10px">Clear filters</button>`);
  }else{
    const rowsHtml = shown.map(e => {
      const p = e.p || (e.p = e.c ? dbCardProduct(e.c, dbPrintsFor(e.c)[0], null) : dbSealedProduct(e.s)), a = e.a;
      return `<tr class="dbr" tabindex="0" onclick="dbOpenProduct('${p.product_id}')" onkeydown="if(event.key==='Enter')dbOpenProduct('${p.product_id}')">
      <td><span class="tpill ${p.type}">${DB_TYPES[p.type]}</span></td>
      <td class="nm"><b>${esc(p.name)}${p.flags?` <span class="vchip warn" title="${esc(p.flags)}">Check</span>`:""}</b><span>${esc(p.set||"No set")}${p.number?" · #"+esc(p.number):""}${p.rarity?" · "+esc(p.rarity):""}</span></td>
      <td>${dbSpec(p)}</td>
      <td class="num">${a.qty?`<b>${a.qty}</b>`:`<span class="muted">–</span>`}</td>
      <td class="num">${p.market_aud===""?`<span class="muted">No price</span>`:money(p.market_aud)}</td>
      <td class="num">${a.qty&&p.market_aud!==""?money(p.market_aud*a.qty):`<span class="muted">–</span>`}</td></tr>`; }).join("");
    const from = DBF.page*DB_PAGE + 1, to = DBF.page*DB_PAGE + shown.length;
    body = `<div class="dbwrap"><table class="dbt"><thead><tr><th>Type</th><th>Item</th><th>Print, kind or grade</th><th class="num">In stock</th><th class="num">Market each</th><th class="num">Stock value</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>
      <div class="dbpager"><span class="muted">${dbN(from)}–${dbN(to)} of ${dbN(all.length)}. Tap a row to see who holds it.</span>
      <span class="dbpg"><button class="btn sm" onclick="dbPage_(-1)"${DBF.page===0?" disabled":""}>Previous</button><span class="muted">Page ${dbN(DBF.page+1)} of ${dbN(pages)}</span><button class="btn sm" onclick="dbPage_(1)"${DBF.page>=pages-1?" disabled":""}>Next</button></span></div>`;
  }
  const io = `<section class="panel" style="margin-top:22px"><div class="panel-h"><h2>Import and export</h2></div>
    <p class="muted" style="font-size:14px;margin-bottom:12px">Export opens straight in Excel. To load a stock list, use the template's columns: <code>${DB_IMPORT_COLS.join(", ")}</code>. Only <code>type</code> and <code>name</code> are required. Add a set or card number so cards with many printings match exactly, or a <code>tcgplayer_id</code> for a sealed product. Slabs need a grade of 10, 9 or 8.</p>
    <div class="hero-cta" style="margin:0"><button class="btn" onclick="dbExport('inventory')">Export inventory CSV</button><button class="btn" onclick="dbExport('products')">Export all cards and products CSV</button><button class="btn" onclick="dbExport('json')">Export everything (JSON)</button>
    <button class="btn" onclick="dbImportPick()">Import CSV</button><button class="btn" onclick="dbExport('template')">Download import template</button></div>
    <input type="file" id="dbimp" accept=".csv,text/csv" hidden onchange="dbImportFile(this)"></section>
    <p class="note">The catalogue holds ${dbN(CAT.cards.length)} English cards from ${dbN(CAT.sets.length)} sets (${CAT.sets[0].name}, ${CAT.sets[0].year}, to ${CAT.sets[CAT.sets.length-1].name}, ${CAT.sets[CAT.sets.length-1].year}), built ${esc(CAT.meta.built||"")}. Japanese and other-language cards are not included. Only ${dbN(Object.keys(CAT.legacy).length)} cards have a price so far (AUD, ${esc(PRICE_META.asOf)}); the rest show "No price" until a price feed is connected or you enter one.
    ${SEAL.state==="ready" ? `The sealed list has ${dbN(SEAL.items.length)} English products, ${dbN(SEAL.meta.priced)} with a TCGplayer market price (US$ at ${PRICE_META.usdToAud} AUD, as of ${esc(SEAL.meta.built)}).` : `The sealed list (data/sealed.js) didn't load, so only sealed product you add yourself appears.`} PSA 10 and PSA 9 use the marketplace multipliers (${GRADE_MULT[10]}× and ${GRADE_MULT[9]}× raw); PSA 8 is estimated at ${GRADE_MULT[8]}× raw. Slabs are limited to PSA 10, 9 and 8. Rows tagged as sample data come from the demo marketplace; rows you add can be edited or removed.</p>`;
  return pageHead("Database","Every English Pokémon card, plus your sealed product and graded slabs.",`<button class="btn primary" onclick="dbOpenForm()">${dbIc("plus",16)}Add item</button>`) + stats + warn + bar + body + io;
}
function dbSetType(t){ DBF.type = t; DBF.page = 0; if(t!=="slab") DBF.grade = "all"; if(t!=="sealed") DBF.kind = "all"; if(t==="sealed"){ DBF.rarity = "all"; DBF.sup = "all"; } render(); }
function dbPage_(d){ DBF.page = Math.max(0, DBF.page + d); render(); window.scrollTo(0, 0); }
function dbClearFilters(){ Object.assign(DBF, {q:"", owner:"all", stockOnly:false, flagged:false, set:"all", rarity:"all", sup:"all", kind:"all", grade:"all", page:0}); render(); }

/* ---------- product detail ---------- */
function dbOpenProduct(id){
  const D = dbBuild(), p = dbProductById(id, D); if(!p) return;
  const lines = D.rows.filter(r=>r.product_id===id);
  const meta = [["Type",DB_TYPES[p.type]],["Set",p.set||"–"],p.number?["Card number",p.number]:null,p.rarity?["Rarity",p.rarity]:null,
    p.supertype?["Card type",p.supertype+(p.subtype?" · "+p.subtype:"")]:null,p.series?["Series",p.series+(p.released?" · released "+p.released:"")]:null,p.dex_no?["Pokédex no.",p.dex_no]:null,
    p.type==="single"&&p.print?["Print",p.print]:null,
    p.type==="slab"?["Grade","PSA "+p.grade+" · "+GRADE_NAME[p.grade]+(p.print?" · "+p.print:"")]:null,
    p.type==="sealed"?["Product",p.sealed_kind+(p.pack_count?" · "+p.pack_count+" packs":"")]:null,
    ["Market value",p.market_aud===""?"No price yet":money(p.market_aud)],["Price basis",DB_BASIS[p.value_basis]],["Product ID",p.product_id]].filter(Boolean);
  const tcg = p.tcgplayer_id ? `<p style="margin:0 0 4px"><a class="link" href="https://www.tcgplayer.com/product/${p.tcgplayer_id}" target="_blank" rel="noopener">View on TCGplayer${ic("ext",14)}</a></p>` : "";
  const tbl = lines.length ? `<table class="ptable"><thead><tr><th>Held by</th><th>Status</th><th class="num">Qty</th><th class="num">Asking</th><th></th></tr></thead><tbody>${lines.map(r=>`<tr>
      <td>${esc(r.owner_name)}${r.owner_type==="me"?` <span class="muted">(you)</span>`:r.owner_type==="store"?` <span class="muted">(store)</span>`:""}${r.cert_number?`<br><span class="muted" style="font-weight:400;font-size:12.5px">Cert ${esc(r.cert_number)}</span>`:""}</td>
      <td>${DB_STATUS[r.status]||r.status}</td><td class="num">${r.qty}</td><td class="num">${r.ask_aud===""?"–":money(r.ask_aud)}</td>
      <td class="num">${r.source==="added"?`<button class="link" onclick="dbOpenForm(null,'${r.stock_id}')">Edit</button> <button class="link" onclick="dbAskRemove('${r.stock_id}')">Remove</button>`:`<span class="muted" style="font-size:12.5px">Sample data</span>`}</td></tr>`).join("")}</tbody></table>`
    : `<p class="muted">Nobody holds this yet.</p>`;
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <span class="tpill ${p.type}">${DB_TYPES[p.type]}</span><h2 style="margin-top:8px">${esc(p.name)}</h2>
    ${p.flags?`<p class="dbwarn" style="margin:12px 0"><span><b>Check this one.</b> ${esc(p.flags)}.</span></p>`:""}
    <dl class="dbmeta" style="margin:16px 0">${meta.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>${tcg}
    <h3 style="font-size:16px;margin:18px 0 8px">Holdings</h3>${tbl}
    <div class="mdl-actions left"><button class="btn primary" onclick="dbOpenForm('${p.product_id}')">Add stock of this</button><button class="btn" onclick="closeModal()">Close</button></div></div>`,{wide:true,label:p.name});
}

/* ---------- add / edit form ---------- */
let DBFORM = null, DBEDIT = null;
const dbBlank = () => ({type:"sealed", card:"", sid:"", manual:false, cq:"", name:"", set:"", print:"raw", kind:"Booster box", packs:"", grade:"10", cert:"", qty:"1", market:"", ask:"", owner:"me", status:"own", note:""});
function dbOpenForm(productId, editId){
  DBEDIT = editId || null; let f = dbBlank();
  if(editId){
    const it = DBX.items.find(x=>x.id===editId); if(!it) return;
    f = Object.assign(f, it, {grade:String(it.grade||"10"), qty:String(it.qty), market:it.market==null?"":String(it.market), ask:it.ask==null?"":String(it.ask), packs:it.packs==null?"":String(it.packs), card:it.card||"", set:it.set||"", cert:it.cert||"", note:it.note||"", kind:it.kind||"Booster box", print:it.print||"raw"});
    f.sid = it.sid ? String(it.sid) : ""; f.manual = !f.card && !f.sid;
  }else if(productId){
    const p = dbProductById(productId, dbBuild());
    if(p){ f.type = p.type; f.card = p.card_id||""; f.name = p.name; f.set = p.set; f.print = p.print_id||"raw"; f.kind = p.sealed_kind||"Booster box"; f.packs = String(p.pack_count||""); f.grade = String(p.grade||"10"); f.sid = p.tcgplayer_id ? String(p.tcgplayer_id) : ""; if(f.sid){ f.name = p.name; f.set = ""; } f.manual = !p.card_id && !f.sid; }
  }
  DBFORM = f; dbFormRender();
}
function dbFormSync(){
  if(!DBFORM) return;
  ["cq","name","set","print","kind","packs","grade","cert","qty","market","ask","owner","status","note"].forEach(k => { const e = document.getElementById("dbf-"+k); if(e) DBFORM[k] = e.value; });
}
function dbFormType(t){ dbFormSync(); DBFORM.type = t; DBFORM.card = ""; DBFORM.sid = ""; DBFORM.manual = false; DBFORM.cq = ""; dbFormRender(); }
function dbFormManual(on){ dbFormSync(); DBFORM.manual = on; if(on){ DBFORM.card = ""; DBFORM.sid = ""; } dbFormRender(); }
function dbFormClearCard(){ dbFormSync(); DBFORM.card = ""; DBFORM.sid = ""; DBFORM.cq = ""; dbFormRender(); }
function dbPickSealed(tid){
  dbFormSync(); const x = SEAL.byTid.get(Number(tid)); if(!x) return;
  DBFORM.sid = String(x.tid); DBFORM.name = x.name; DBFORM.kind = x.kind; DBFORM.manual = false; dbFormRender();
}
function dbPickCard(id){
  dbFormSync(); const c = CAT.byId.get(id); if(!c) return;
  DBFORM.card = id; DBFORM.name = c.name; DBFORM.manual = false;
  const pr = dbPrintsFor(c); if(!pr.includes(DBFORM.print)) DBFORM.print = pr[0];
  dbFormRender();
}
// 0 = the name is exactly what was typed, 1 = starts with it, 2 = starts with the first word, 3 = anything else
function dbRank(name, words){
  const n = name.toLowerCase(), phrase = words.join(" ");
  return n===phrase ? 0 : n.startsWith(phrase) ? 1 : n.startsWith(words[0]) ? 2 : 3;
}
function dbCardSearch(q){
  if(!DBFORM) return; DBFORM.cq = q; const box = document.getElementById("dbf-res"); if(!box) return;
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if(!words.length){ box.innerHTML = ""; return; }
  if(DBFORM.type==="sealed"){
    const found = [];
    for(const x of SEAL.items){ if(words.every(w => x.hay.includes(w))){ found.push(x); if(found.length>=400) break; } }
    found.sort((a,b) => dbRank(a.name, words) - dbRank(b.name, words) || a.name.length - b.name.length || dbCmp(b.sk,a.sk));
    box.innerHTML = found.length
      ? found.slice(0,8).map(x => `<button class="dbhit" onclick="dbPickSealed(${x.tid})"><b>${esc(x.name)}</b><span>${esc(x.set||"No set")} · ${esc(x.kind)}${x.aud!==""?" · "+money(x.aud):""}</span></button>`).join("") + (found.length>8 ? `<p class="muted dbhint">Showing 8 of ${found.length>=400?"400+":found.length}. Add a set name or a word like "booster box" to narrow it.</p>` : "")
      : `<p class="muted dbhint">No sealed products match. Try fewer words, or enter it by hand.</p>`;
    return;
  }
  const hits = [];
  for(const c of CAT.cards){ if(words.every(w => c.hay.includes(w))){ hits.push(c); if(hits.length>=400) break; } }
  hits.sort((a,b) => dbRank(a.name, words) - dbRank(b.name, words) || a.name.length - b.name.length || dbCmp(b.set.date, a.set.date));
  box.innerHTML = hits.length
    ? hits.slice(0,8).map(c => `<button class="dbhit" onclick="dbPickCard('${c.id}')"><b>${esc(c.name)}</b><span>${esc(c.set.name)} · #${esc(c.num)}${c.rarity?" · "+esc(c.rarity):""}</span></button>`).join("") + (hits.length>8 ? `<p class="muted dbhint">Showing 8 of ${hits.length>=400?"400+":hits.length}. Add a set name or card number to narrow it.</p>` : "")
    : `<p class="muted dbhint">No cards match. Try fewer words, or enter it by hand.</p>`;
}
function dbFormRender(){
  const f = DBFORM, t = f.type, card = (t!=="sealed" && f.card) ? CAT.byId.get(f.card) : null;
  const sealedPick = (t==="sealed" && f.sid) ? (SEAL.byTid.get(Number(f.sid)) || null) : null;
  if(t==="sealed" && !SEAL.items.length && !f.sid) f.manual = true;              // no catalogue to search
  const fld = (label,inner,cls) => `<label class="field ${cls||""}">${label}${inner}</label>`;
  const inp = (id,extra) => `<input id="dbf-${id}" value="${esc(f[id]||"")}" ${extra||""}>`;
  const sel = (id,opts,extra) => `<select id="dbf-${id}" ${extra||""}>${opts.map(([v,l])=>`<option value="${esc(v)}"${String(v)===String(f[id])?" selected":""}>${esc(l)}</option>`).join("")}</select>`;
  const ownerOpts = [["me",me.name+" (you)"]].concat(STORES.map(s=>[s.id,s.name+" (store)"]), USERS.map(u=>[u.id,u.name]));
  const prints = card ? dbPrintsFor(card) : ["raw","unl","shadow","first"];
  const grade = t==="slab" ? Number(f.grade) : null, print = prints.includes(f.print) ? f.print : prints[0];
  let h = "";
  if(t!=="sealed"){
    if(card){
      h += `<div class="field full"><span>Card</span><div class="dbpick"><div><b>${esc(card.name)}</b><span>${esc(card.set.name)} · #${esc(card.num)}${card.rarity?" · "+esc(card.rarity):""}</span></div><button class="link" onclick="dbFormClearCard()">Change</button></div></div>`;
    }else if(f.manual){
      h += fld("Card name", inp("name",`data-autofocus`), "") + fld("Set (optional)", inp("set",`list="dbsets"`), "");
      h += `<div class="full"><button class="link" onclick="dbFormManual(false)">Search the catalogue instead</button></div>`;
    }else{
      h += fld("Card", inp("cq",`data-autofocus placeholder="Search ${dbN(CAT.cards.length)} cards by name, set or number" autocomplete="off" oninput="dbCardSearch(this.value)"`), "full");
      h += `<div id="dbf-res" class="dbres full"></div><div class="full"><button class="link" onclick="dbFormManual(true)">Can't find it? Enter it by hand</button></div>`;
    }
    if(t==="single") h += fld("Print", sel("print",prints.map(id=>[id,DB_PRINTS[id]])), "");
    else{
      if(card && prints.length>1) h += fld("Print", sel("print",prints.map(id=>[id,DB_PRINTS[id]])), "");
      h += fld("PSA grade", sel("grade",SLAB_GRADES.map(g=>[String(g),"PSA "+g+" · "+GRADE_NAME[g]]),`onchange="dbFormSync();dbFormRender()"`), "");
      h += fld("PSA cert number (optional)", inp("cert",`inputmode="numeric" placeholder="Digits only"`), "");
    }
  }else if(sealedPick){
    h += `<div class="field full"><span>Product</span><div class="dbpick"><div><b>${esc(sealedPick.name)}</b><span>${esc(sealedPick.set||"No set")} · ${esc(sealedPick.kind)}</span></div><button class="link" onclick="dbFormClearCard()">Change</button></div></div>`;
  }else if(f.manual){
    h += fld("Product name", inp("name",`data-autofocus placeholder="For example, Evolving Skies Booster Box"`), "full");
    h += fld("Set", inp("set",`list="dbsets" placeholder="Start typing a set name"`), "");
    h += fld("Kind", sel("kind",SEALED_KINDS.map(k=>[k,k])), "");
    h += fld("Packs inside (optional)", inp("packs",`inputmode="numeric"`), "");
    if(SEAL.items.length) h += `<div class="full"><button class="link" onclick="dbFormManual(false)">Search the sealed catalogue instead</button></div>`;
  }else{
    h += fld("Sealed product", inp("cq",`data-autofocus placeholder="Search ${dbN(SEAL.items.length)} products, for example 'evolving skies elite'" autocomplete="off" oninput="dbCardSearch(this.value)"`), "full");
    h += `<div id="dbf-res" class="dbres full"></div><div class="full"><button class="link" onclick="dbFormManual(true)">Can't find it? Enter it by hand</button></div>`;
  }
  h += fld("Quantity", inp("qty",`inputmode="numeric"`), "");
  const built = card ? dbCardValue(card, print, grade) : (sealedPick ? sealedPick.aud : "");
  h += built!=="" ? `<div class="field"><span>Market value each</span><div style="margin-top:9px;font-weight:600;color:var(--ink)">${money(built)} <span class="muted" style="font-weight:400;font-size:12.5px">calculated</span></div></div>`
             : fld("Market value each, AUD (optional)", inp("market",`inputmode="decimal" placeholder="Leave blank if unknown"`), "");
  h += fld("Asking price each, AUD (optional)", inp("ask",`inputmode="decimal"`), "");
  h += fld("Held by", sel("owner",ownerOpts), "");
  h += fld("Status", sel("status",Object.entries(DB_STATUS)), "");
  h += fld("Note (optional)", inp("note"), "full");
  const seg = Object.entries(DB_TYPES).map(([id,l])=>`<button class="${t===id?"on":""}" aria-pressed="${t===id}" onclick="dbFormType('${id}')">${l}</button>`).join("");
  const setList = `<datalist id="dbsets">${CAT.sets.map(s=>`<option value="${esc(s.name)}"></option>`).join("")}</datalist>`;
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>${DBEDIT?"Edit item":"Add item"}</h2>
    <div class="segc" role="group" aria-label="Product type" style="margin:14px 0 4px">${seg}</div>
    <div class="dbg">${h}</div>${setList}<p class="dberr" id="dbferr" role="alert"></p>
    <div class="mdl-actions left"><button class="btn primary" onclick="dbFormSave()">${DBEDIT?"Save changes":"Add to database"}</button><button class="btn" onclick="closeModal()">Cancel</button></div></div>`,{wide:true,label:DBEDIT?"Edit item":"Add item"});
  if(!card && !sealedPick && !f.manual && f.cq) dbCardSearch(f.cq);
}
function dbFormSave(){
  dbFormSync(); const f = DBFORM, t = f.type;
  const fail = m => { const e = document.getElementById("dbferr"); if(e) e.textContent = m; return false; };
  const card = (t!=="sealed" && f.card) ? CAT.byId.get(f.card) : null;
  const sealedPick = (t==="sealed" && f.sid) ? (SEAL.byTid.get(Number(f.sid)) || null) : null;
  const name = card ? card.name : sealedPick ? sealedPick.name : String(f.name||"").trim();
  if(!name) return fail(t==="sealed" ? "Choose a product, or enter its name by hand." : "Choose a card, or enter its name by hand.");
  if(t!=="sealed" && !card && !f.manual) return fail("Choose a card from the search results, or enter it by hand.");
  if(t==="sealed" && !sealedPick && !f.manual && SEAL.items.length) return fail("Choose a product from the search results, or enter it by hand.");
  let grade = null;
  if(t==="slab"){ grade = Number(f.grade); if(!SLAB_GRADES.includes(grade)) return fail("Slabs are limited to PSA 10, 9 or 8."); }
  const cert = t==="slab" ? String(f.cert||"").trim() : "";
  if(cert && !/^\d{5,10}$/.test(cert)) return fail("A PSA cert number is digits only.");
  const qty = parseInt(f.qty,10); if(!(qty>=1 && qty<=9999) || String(qty)!==String(f.qty).trim()) return fail("Quantity must be a whole number from 1 to 9999.");
  const num = v => String(v).trim()==="" ? null : (isFinite(Number(v)) && Number(v)>=0 ? Number(v) : NaN);
  const prints = card ? dbPrintsFor(card) : null;
  const print = t==="sealed" ? "" : card ? (prints.includes(f.print) ? f.print : prints[0]) : (t==="single" ? (DB_PRINTS[f.print] ? f.print : "raw") : "");
  const priced = (card && dbCardValue(card, print, grade)!=="") || (sealedPick && sealedPick.aud!=="");
  const market = priced ? null : num(f.market), ask = num(f.ask);
  if(Number.isNaN(market) || Number.isNaN(ask)) return fail("Prices must be numbers, zero or more.");
  const packs = (t==="sealed" && !sealedPick && String(f.packs).trim()!=="") ? parseInt(f.packs,10) : null;
  if(packs!==null && !(packs>=1)) return fail("Pack count must be a whole number.");
  const item = {id:DBEDIT||("u"+(++DBX.seq)), type:t, card:card?card.id:"", sid:sealedPick?sealedPick.tid:null, name, set:(card||sealedPick)?"":String(f.set||"").trim(), print,
    kind:t==="sealed"?(sealedPick?sealedPick.kind:f.kind):"", packs, grade, cert, qty, market, ask, owner:f.owner||"me", status:DB_STATUS[f.status]?f.status:"own", note:String(f.note||"").trim()};
  if(DBEDIT){ const i = DBX.items.findIndex(x=>x.id===DBEDIT); if(i>=0) DBX.items[i] = item; else DBX.items.push(item); } else DBX.items.push(item);
  const was = DBEDIT; saveDb(); closeModal(); DBEDIT = null; render(); toast((was?"Updated ":"Added ")+plural(qty,"item")+": "+name+(grade?" PSA "+grade:"")+".");
  return true;
}
function dbAskRemove(id){
  const it = DBX.items.find(x=>x.id===id); if(!it) return;
  openModal(`<div class="mdl-c"><h2>Remove this line?</h2><p>${esc(it.name)}${it.grade?" PSA "+it.grade:""}, quantity ${it.qty}. This only removes the line you added.</p>
    <div class="mdl-actions"><button class="btn danger" onclick="dbRemove('${id}')">Remove</button><button class="btn" onclick="closeModal()">Keep it</button></div></div>`,{label:"Remove line"});
}
function dbRemove(id){ DBX.items = DBX.items.filter(x=>x.id!==id); saveDb(); closeModal(); render(); toast("Removed."); }

/* ---------- export ---------- */
const dbCell = v => { v = v==null ? "" : String(v); return /[",\r\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; };
const dbCsv = (cols,rows) => [cols.join(",")].concat(rows.map(r=>cols.map(c=>dbCell(r[c])).join(","))).join("\r\n");
function dbDownload(name, text, mime){
  try{
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text],{type:mime})); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1500);
  }catch(e){ toast("Downloads aren't available in this view."); }
}
function dbExport(kind){
  if(CAT.state!=="ready"){ toast("The card catalogue is still loading."); return; }
  const D = dbExportData(), day = new Date().toISOString().slice(0,10), bom = "\ufeff";   // BOM so Excel reads é correctly
  if(kind==="inventory") dbDownload(`binder-loop-inventory-${day}.csv`, bom+dbCsv(DB_INV_COLS,D.inventory), "text/csv");
  else if(kind==="products") dbDownload(`binder-loop-products-${day}.csv`, bom+dbCsv(DB_PRODUCT_COLS,D.products), "text/csv");
  else if(kind==="template") dbDownload("binder-loop-import-template.csv", bom+dbCsv(DB_IMPORT_COLS,[]), "text/csv");
  else dbDownload(`binder-loop-database-${day}.json`, JSON.stringify(D), "application/json");
}

/* ---------- import ---------- */
function dbParseCsv(text){
  const rows = []; let row = [], cell = "", q = false;
  for(let i=0;i<text.length;i++){
    const ch = text[i];
    if(q){ if(ch==='"'){ if(text[i+1]==='"'){ cell += '"'; i++; } else q = false; } else cell += ch; }
    else if(ch==='"') q = true;
    else if(ch===","){ row.push(cell); cell = ""; }
    else if(ch==="\n" || ch==="\r"){ if(ch==="\r" && text[i+1]==="\n") i++; row.push(cell); cell = ""; if(row.some(c=>c.trim()!=="")) rows.push(row); row = []; }
    else cell += ch;
  }
  row.push(cell); if(row.some(c=>c.trim()!=="")) rows.push(row);
  return rows;
}
function dbImportPick(){ const i = document.getElementById("dbimp"); if(i) i.click(); }
function dbImportFile(inp){
  const f = inp.files && inp.files[0]; if(!f) return;
  const r = new FileReader(); r.onload = () => dbImportText(String(r.result)); r.readAsText(f); inp.value = "";
}
// find one catalogue card from a name plus optional set and number; n is how many matched
function dbMatchCard(name, setTxt, numTxt, idTxt){
  if(idTxt){ const c = CAT.byId.get(idTxt.trim()); return {card:c||null, n:c?1:0, byId:true}; }
  let cand = CAT.byName.get(dbNorm(name)) || [];
  if(setTxt){
    const t = setTxt.trim().toLowerCase(), sid = CAT.setLookup.get(t);
    cand = sid ? cand.filter(c => c.set.id===sid) : cand.filter(c => c.set.name.toLowerCase().startsWith(t));
  }
  if(numTxt){ const clean = s => String(s).trim().toLowerCase().replace(/^0+(?=\d)/,""), n = clean(numTxt); cand = cand.filter(c => clean(c.num)===n); }
  return {card:cand.length===1?cand[0]:null, n:cand.length};
}
// find one sealed catalogue product from a name plus optional set, or a TCGplayer id; n is how many matched
function dbMatchSealed(name, setTxt, tidTxt){
  if(tidTxt){ const x = SEAL.byTid.get(Number(String(tidTxt).trim())); return {item:x||null, n:x?1:0, byId:true}; }
  let cand = SEAL.byName.get(dbNorm(name)) || [];
  if(setTxt){
    const t = setTxt.trim().toLowerCase(), sid = CAT.setLookup.get(t);
    cand = sid ? cand.filter(x => x.setId===sid) : cand.filter(x => x.set.toLowerCase().startsWith(t));
  }
  return {item:cand.length===1?cand[0]:null, n:cand.length};
}
function dbImportText(text){
  if(CAT.state!=="ready") return confirmModal({title:"Catalogue still loading", msg:"Give it a moment, then import again.", close:"Close"});
  const rows = dbParseCsv(text.replace(/^\ufeff/,""));
  const stop = (title,msg) => confirmModal({title, msg, close:"Close"});
  if(rows.length<2) return stop("Nothing to import","The file needs a header row and at least one item row.");
  if(rows.length>5001) return stop("File too large","Import up to 5,000 rows at a time.");
  const head = rows[0].map(h=>h.trim().toLowerCase().replace(/\s+/g,"_"));
  const col = (...names) => { for(const n of names){ const i = head.indexOf(n); if(i>=0) return i; } return -1; };
  const C = {type:col("type","product_type"), name:col("name","item"), set:col("set","set_name"), number:col("number","card_number"), id:col("card_id"), tid:col("tcgplayer_id","tcgplayer"), kind:col("kind","sealed_kind"), print:col("print"),
    packs:col("pack_count","packs"), grade:col("grade","psa","psa_grade"), cert:col("cert","cert_number"), qty:col("qty","quantity"),
    market:col("market_aud","market","market_value"), ask:col("ask_aud","ask","asking"), status:col("status"), note:col("note","notes")};
  if(C.type<0 || (C.name<0 && C.id<0 && C.tid<0)) return stop("Columns missing","The first row must include a type column and a name column (or a card_id or tcgplayer_id column).");
  const get = (r,k) => C[k]>=0 ? String(r[C[k]]==null?"":r[C[k]]).trim() : "";
  const money2 = v => { if(v==="") return null; const n = parseFloat(v.replace(/[$,\s]/g,"")); return isFinite(n)&&n>=0 ? n : NaN; };
  let added = 0, linked = 0; const skipped = [];
  rows.slice(1).forEach((r,i) => {
    const line = i+2; let type = get(r,"type").toLowerCase();
    if(type==="singles") type = "single"; if(type==="slabs"||type==="slabbed"||type==="graded") type = "slab";
    let name = get(r,"name"); const idTxt = get(r,"id");
    if(!DB_TYPES[type]) return skipped.push(`Row ${line}: type must be single, sealed or slab`);
    let grade = null;
    if(type==="slab"){
      const m = /(\d+(?:\.\d+)?)/.exec(get(r,"grade")); grade = m ? Number(m[1]) : NaN;
      if(!SLAB_GRADES.includes(grade)) return skipped.push(`Row ${line}: slabs must be PSA 10, 9 or 8`);
    }
    const qtyTxt = get(r,"qty"), qty = qtyTxt==="" ? 1 : Number(qtyTxt);
    if(!(Number.isInteger(qty) && qty>=1 && qty<=9999)) return skipped.push(`Row ${line}: quantity must be a whole number`);
    const market = money2(get(r,"market")), ask = money2(get(r,"ask"));
    if(Number.isNaN(market) || Number.isNaN(ask)) return skipped.push(`Row ${line}: price isn't a number`);
    const cert = type==="slab" ? get(r,"cert") : "";
    if(cert && !/^\d{5,10}$/.test(cert)) return skipped.push(`Row ${line}: cert number must be digits only`);
    const stTxt = get(r,"status").toLowerCase(), status = /sell|sale/.test(stTxt) ? "sell" : /trade/.test(stTxt) ? "trade" : "own";
    const setTxt = get(r,"set"), printTxt = get(r,"print").toLowerCase();
    let card = "", sid = null, print = "", kind = "", note = get(r,"note");
    if(type==="sealed"){
      const tidTxt = get(r,"tid"), ms = SEAL.items.length ? dbMatchSealed(name, setTxt, tidTxt) : {item:null, n:0};
      if(ms.byId && !ms.item) return skipped.push(`Row ${line}: tcgplayer_id "${tidTxt}" isn't in the sealed catalogue`);
      if(!name && !ms.item) return skipped.push(`Row ${line}: no name`);
      if(ms.n>1) return skipped.push(`Row ${line}: "${name}" matches ${ms.n} sealed products. Add a set or a tcgplayer_id`);
      if(ms.item){ sid = ms.item.tid; name = ms.item.name; kind = ms.item.kind; linked++; }
      else{
        const kt = get(r,"kind"), hit = SEALED_KINDS.find(k=>k.toLowerCase()===kt.toLowerCase());
        kind = hit || "Other"; if(kt && !hit) note = kt + (note ? "; "+note : "");
      }
    }else{
      const m = dbMatchCard(name, setTxt, get(r,"number"), idTxt);
      if(m.byId && !m.card) return skipped.push(`Row ${line}: card_id "${idTxt}" isn't in the catalogue`);
      if(!name && !m.card) return skipped.push(`Row ${line}: no name`);
      if(m.n>1) return skipped.push(`Row ${line}: "${name}" matches ${m.n} cards. Add a set or card number`);
      const want = /1st|first/.test(printTxt) ? "first" : /shadow/.test(printTxt) ? "shadow" : /unl/.test(printTxt) ? "unl" : null;
      if(m.card){
        card = m.card.id; name = m.card.name; linked++;
        const pr = dbPrintsFor(m.card); print = (want && pr.includes(want)) ? want : pr[0];
        if(want && !pr.includes(want)) note = `Requested print "${printTxt}" doesn't exist for this card` + (note ? "; "+note : "");
      }else print = want || (/raw/.test(printTxt) ? "raw" : "raw");
    }
    const packs = type==="sealed" && get(r,"packs") ? parseInt(get(r,"packs"),10) : null;
    DBX.items.push({id:"u"+(++DBX.seq), type, card, sid, name, set:(card||sid)?"":setTxt, print:type==="sealed"?"":print, kind, packs:(sid?null:(packs>=1?packs:null)), grade, cert, qty, market:(card||(sid&&SEAL.byTid.get(sid).aud!==""))?null:market, ask, owner:"me", status, note});
    added++;
  });
  saveDb(); render();
  const list = skipped.slice(0,6).map(s=>"<br>"+esc(s)).join("") + (skipped.length>6 ? `<br>and ${skipped.length-6} more` : "");
  confirmModal({title:added?`Imported ${plural(added,"line")}`:"Nothing imported", msg:(added?`${linked} matched the catalogue. `:"")+(skipped.length?`${plural(skipped.length,"row")} skipped:${list}`:"Every row went in."), close:"Close"});
}

// the catalogue is already here when the page carries it inline (tests, exports); otherwise it loads on first visit
if(window.__CATALOG) catInit(window.__CATALOG);
