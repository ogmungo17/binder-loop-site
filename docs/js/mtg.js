/* =====================================================================
   Magic: The Gathering in the marketplace. A game switch (Pokémon or MTG) sits on every card search, and choosing MTG
   shows only Magic results: every paper printing and sealed product, priced from Card Kingdom (what it sells for and
   what it pays on its buylist, in USD, shown in AUD at the site's rate). Printings become ordinary marketplace cards
   (key "m_...") when they're listed, added to a binder or want list, or used by the sample collectors, so selling,
   buying, offers and trades work as they do for Pokémon. Loads data/mtg.js the first time MTG is chosen.
   Loaded after card-filters.js.

   window.__MTG = {v:1, built:"2026-09-30", source:"...",
     sets:[[code, name, type, date], ...]              oldest first
     names:[card name, ...]  lines:[type line, ...]  vars:["", "Borderless", ...]
     rar:["common","uncommon","rare","mythic", ...]    kinds:["Booster box", ...]
     cards:[[set, number, name, rarity, line, colours, [nf,foil,etched], [nf,foil,etched], variation], ...]
     sealed:[[id, name, kind, set or -1, retail, buylist], ...] }
   set, name, rarity, line, variation and kind are indexes into the tables above; colours is a bit mask
   (W 1, U 2, B 4, R 8, G 16); every price is whole US cents, 0 meaning Card Kingdom doesn't list it, and the
   buylist array and variation can be left off the end of a row when empty.
   ===================================================================== */
const MTG = {state:"idle", meta:{}, sets:[], setByCode:{}, cards:[], sealed:[], kinds:[], waiters:[], memo:{},
  byName:new Map(), nameIdx:new Map(), byMid:new Map(), sealedById:new Map()};
const MTG_COLORS = [["w","White",1],["u","Blue",2],["b","Black",4],["r","Red",8],["g","Green",16]];
const MTG_HUE = {1:48,2:212,4:272,8:6,16:122};
const MTG_TYPES = ["Creature","Instant","Sorcery","Artifact","Enchantment","Planeswalker","Land","Battle","Kindred"];
const MTG_TYPE_RX = MTG_TYPES.map(t=>new RegExp("\\b"+(t==="Kindred"?"(Kindred|Tribal)":t)+"\\b"));
const MTG_ALT_RX = /borderless|extended|showcase|alternate|full[- ]?art|textless/i;   // Card Kingdom's variation labels that mean different art or frame
const MTG_STD_SETS = new Set(["core","expansion","masters","commander","draft_innovation"]);
const MTG_SET_TYPES = {core:"Core sets", expansion:"Expansions", masters:"Masters and reprint sets", draft_innovation:"Draft innovation", commander:"Commander",
  starter:"Starter and intro", box:"Box sets", funny:"Un-sets", promo:"Promos", duel_deck:"Duel decks", from_the_vault:"From the Vault", premium_deck:"Premium decks",
  planechase:"Planechase", archenemy:"Archenemy", spellbook:"Spellbooks", treasure_chest:"Treasure chests", alchemy:"Alchemy", memorabilia:"Memorabilia",
  token:"Tokens", minigame:"Minigames", vanguard:"Vanguard"};
const mtgCmp = (a,b)=>a<b?-1:a>b?1:0;
const mtgPad = n=>String(n).replace(/\d+/g,m=>m.padStart(4,"0"));
const mtgCap = s=>s.charAt(0).toUpperCase()+s.slice(1);
const mtgAud = c=>Math.round(c*PRICE_META.usdToAud)/100;
const mtgMoney = c=>c?money(mtgAud(c)):"–";
const mtgUsd = c=>c?"US$"+(c/100).toFixed(2):"";
const mtgHue = col=>col===0?200:MTG_HUE[col]||42;
const mtgFirst = c=>c.p[0]||c.p[1]||c.p[2]||0;

/* ---------- loading ---------- */
function mtgLoad(cb){
  if(MTG.state==="ready"){ if(cb) cb(); return; }
  if(cb && !MTG.waiters.includes(cb)) MTG.waiters.push(cb);
  if(MTG.state==="loading") return;
  if(window.__MTG){ mtgInit(window.__MTG); return; }
  MTG.state = "loading";
  const s = document.createElement("script"); s.src = "data/mtg.js?v="+(window.BL_V||"");
  s.onload = () => { if(window.__MTG) mtgInit(window.__MTG); else mtgFail(); };
  s.onerror = () => { s.remove(); mtgFail(); };
  document.head.appendChild(s);
}
function mtgFail(){ MTG.state = "error"; MTG.waiters.splice(0); render(); }
function mtgInit(d){
  try{
    MTG.meta = {built:d.built, source:d.source, priced:0};
    MTG.kinds = d.kinds || [];
    MTG.sets = d.sets.map((s,i) => { const o = {i, code:s[0], name:s[1], type:s[2], date:s[3], year:Number(String(s[3]).slice(0,4))||0, n:0, sealed:0}; MTG.setByCode[o.code] = o; return o; });
    const mask = d.lines.map(l => MTG_TYPE_RX.reduce((m,rx,i) => m | (rx.test(l) ? 1<<i : 0), 0));
    d.names.forEach((n,i) => MTG.nameIdx.set(n.toLowerCase(), i));
    MTG.cards = d.cards.map((r,i) => {
      const s = MTG.sets[r[0]], name = d.names[r[2]], line = d.lines[r[4]], p = r[6], b = r[7] || [0,0,0], v = d.vars[r[8]||0] || "";
      const c = {i, set:s, num:String(r[1]), name, ni:r[2], rar:d.rar[r[3]], line, col:r[5], tm:mask[r[4]], p, b, v, alt:!!v && MTG_ALT_RX.test(v), price:p[0]||p[1]||p[2]||0, buy:b[0]||b[1]||b[2]||0};
      c.hay = [name, s.name, s.code, c.num, line, c.rar, v].join(" ").toLowerCase();
      c.nk = name.toLowerCase()+"|"+s.date+"|"+mtgPad(c.num);
      c.sk = s.date+"|"+s.code+"|"+mtgPad(c.num);
      s.n++; if(c.price) MTG.meta.priced++;
      let a = MTG.byName.get(c.ni); if(!a) MTG.byName.set(c.ni, a = []); a.push(c);
      MTG.byMid.set(s.code+"|"+c.num, c);
      return c;
    });
    MTG.sealed = d.sealed.map((r,i) => {
      const s = r[3]>=0 ? MTG.sets[r[3]] : null, x = {i, id:r[0], name:r[1], kind:d.kinds[r[2]], set:s, price:r[4]||0, buy:r[5]||0};
      x.hay = [x.name, s?s.name:"", s?s.code:"", x.kind].join(" ").toLowerCase();
      x.nk = x.name.toLowerCase(); x.sk = (s?s.date:"0000")+"|"+x.nk;
      if(s) s.sealed++;
      MTG.sealedById.set(x.id, x);
      return x;
    });
    MTG.state = "ready";
    mtgRefresh(); mtgSeed();
    MTG.waiters.splice(0).forEach(f => { try{ f(); }catch(e){} });
  }catch(e){ console.error("Magic data didn't load", e); mtgFail(); }
}

/* ---------- printings as marketplace cards ---------- */
// the marketplace card for a printing; v is the normal (else foil) price in AUD, and each finish's price is v times its variant's mult
function mtgEntry(c){
  const usd = c.p.slice(0,3), base = usd.find(x=>x)||0;
  return {n:c.name, s:[c.set.name, "#"+c.num, mtgCap(c.rar)].concat(c.v?[c.v]:[]).join(", "), v:base*PRICE_META.usdToAud/100, h:mtgHue(c.col), game:"mtg",
    mid:c.set.code+"|"+c.num, sc:c.set.code, set:c.set.name, rar:c.rar, var:c.v, col:c.col, usd, buy:c.b.slice(0,3)};
}
const mtgSnap = e=>({n:e.n, s:e.s, v:e.v, h:e.h, game:"mtg", mid:e.mid, sc:e.sc, set:e.set, rar:e.rar, var:e.var, col:e.col, usd:e.usd, buy:e.buy});
const mtgKeyOf = c=>"m_"+(c.set.code+"-"+c.num).replace(/[^A-Za-z0-9-]/g, ch=>"_"+ch.charCodeAt(0).toString(16));
function mtgEnsure(c){
  const k = mtgKeyOf(c), e = mtgEntry(c);
  if(CARDS[k]){ Object.assign(CARDS[k], e); delete CARDS[k].vs; } else CARDS[k] = e;
  return k;
}
// once the data is in, saved Magic cards pick up today's Card Kingdom prices
function mtgRefresh(){
  Object.keys(CARDS).forEach(k=>{
    const e = CARDS[k]; if(e.game!=="mtg") return;
    const c = MTG.byMid.get(e.mid); if(c){ Object.assign(e, mtgEntry(c)); delete e.vs; }
  });
}
// anything your binder, want list, offers, nights or sales point at is kept in this browser, so it loads without the big data file
function mtgPersistRefs(){
  if(typeof CUSTOM_CARDS==="undefined") return;
  const keys = new Set(), add = k=>{ if(k && gameOf(k)==="mtg") keys.add(k); };
  Object.keys(me.cards).forEach(add); me.wants.forEach(add); SELL.sold.forEach(x=>add(x.k));
  OFFERS.forEach(o=>{ (o.give||[]).forEach(add); (o.get||[]).forEach(add); });
  Object.values(NIGHTS).forEach(p=>{ (p.bring||[]).forEach(add); (p.seek||[]).forEach(add); });
  let changed = false;
  keys.forEach(k=>{ const snap = mtgSnap(CARDS[k]); if(JSON.stringify(CUSTOM_CARDS[k])!==JSON.stringify(snap)){ CUSTOM_CARDS[k] = snap; changed = true; } });
  if(changed) saveCustomCards();
}

/* ---------- the game switch ---------- */
function gameSwitch(){
  return `<div class="gsw" role="radiogroup" aria-label="Game"><span class="gsw-l">Game</span>${GAMES.map(([id,l])=>`<button type="button" role="radio" class="gsw-b${GM.game===id?" on":""}" aria-checked="${GM.game===id}" onclick="setGame('${id}')">${id==="mtg"?"Magic: The Gathering":l}</button>`).join("")}</div>`;
}
// the page behind a list or add pop-up follows the game too
function gameRedraw(){ const kind=MODAL_KIND; render(); if(kind==="list") renderListModal(); else if(kind==="add") openAddCard(); }
function setGame(g){
  if(g===GM.game) return;
  GM.game = g; try{ localStorage.setItem("binderloop.game", g); }catch(e){}
  Object.keys(CF).forEach(c=>{ CF[c].set = "all"; });   // a set belongs to one game
  if(F2.sort==="buy") F2.sort = "name";
  F2.limit = 24;
  if(g==="mtg" && MTG.state==="idle") mtgLoad(gameRedraw);
  gameRedraw();
}
function mtgGateBody(retry){
  if(MTG.state==="error") return emptyBox("The Magic database isn't on this site yet","The file data/mtg.js wasn't found, or it couldn't be read.",`<button class="btn primary" onclick="MTG.state='idle';${retry}">Try again</button>`);
  return `<div class="empty" role="status"><b>Loading the Magic database…</b><p>Every card and sealed product. This only happens the first time.</p></div>`;
}
function mtgGate(pre){ if(MTG.state==="idle") mtgLoad(()=>render()); return pre+mtgGateBody("render()"); }

/* ---------- Search: Magic results ---------- */
const MX = {rar:"all", type:"all", cols:[], none:false, buy:false};    // Search's extra Magic filters (set, foil, sealed, graded and alt art use the shared bar)
const mxActive = ()=>MX.rar!=="all"||MX.type!=="all"||MX.cols.length>0||MX.none||MX.buy;
function mxSet(patch){ Object.assign(MX,patch); F2.limit=24; render(); }
function mxColour(m){ if(m===0){ MX.none=!MX.none; MX.cols=[]; } else { MX.none=false; MX.cols=MX.cols.includes(m)?MX.cols.filter(x=>x!==m):MX.cols.concat(m); } F2.limit=24; render(); }
function mxReset(){ Object.assign(MX,{rar:"all",type:"all",cols:[],none:false,buy:false}); }
function mtgSearchFiltersActive(){ return F2.sort!=="name" || cfActive(cfState("search")) || mxActive() || F2.min!=="" || F2.max!=="" || F2.stock; }
// every printing and sealed product that matches the search box, the shared filter bar, the Magic filters and price range, sorted
function mtgSearchResults(){
  const f = cfState("search"), key = JSON.stringify([F2.q,f,MX,F2.sort,F2.min,F2.max,F2.stock]);
  if(MTG.memo.q && MTG.memo.q.key===key) return MTG.memo.q.list;
  const words = F2.q.trim().toLowerCase().split(/\s+/).filter(Boolean), out = [];
  if(!words.length && !mtgSearchFiltersActive()){
    MTG.cards.filter(c=>c.price).sort((a,b)=>b.price-a.price||mtgCmp(a.nk,b.nk)).slice(0,120).forEach(c=>out.push({kind:"mcard",c}));   // featured: the most valuable printings
  }else{
    const tb = MX.type==="all"?0:1<<MTG_TYPES.indexOf(MX.type), cm = MX.cols.reduce((m,x)=>m|x,0);
    if(!f.sealed && !f.graded) for(const c of MTG.cards){
      if(f.set!=="all" && c.set.code!==f.set) continue;
      if(f.holo && !(c.p[1]||c.p[2])) continue;
      if(f.alt && !c.alt) continue;
      if(MX.rar!=="all" && c.rar!==MX.rar) continue;
      if(tb && !(c.tm&tb)) continue;
      if(MX.none ? c.col!==0 : cm && (c.col&cm)!==cm) continue;
      if(MX.buy && !c.buy) continue;
      let ok = true; for(const w of words) if(!c.hay.includes(w)){ ok = false; break; }
      if(ok) out.push({kind:"mcard",c});
    }
    const cardOnly = f.holo||f.alt||f.graded||MX.rar!=="all"||tb||cm||MX.none;
    if(!cardOnly) for(const x of MTG.sealed){
      if(f.set!=="all" && (!x.set || x.set.code!==f.set)) continue;
      if(MX.buy && !x.buy) continue;
      let ok = true; for(const w of words) if(!x.hay.includes(w)){ ok = false; break; }
      if(ok) out.push({kind:"mseal",x});
    }
  }
  out.forEach(h=>{
    if(h.kind==="mcard"){ const c=h.c; h.price=c.price?mtgAud(c.price):null; h.buyA=c.buy?mtgAud(c.buy):0; h.name=c.name; h.sk=c.sk; }
    else { const x=h.x; h.price=x.price?mtgAud(x.price):null; h.buyA=x.buy?mtgAud(x.buy):0; h.name=x.name; h.sk=x.sk; }
  });
  let hits = out;
  if(F2.stock) hits = hits.filter(h=>{ if(h.kind!=="mcard") return false; const k=mtgKeyOf(h.c); return CARDS[k] && holdersOf(k)+stockedAt(k)>0; });
  if(F2.min!==""||F2.max!==""){ const mn=+F2.min||0, mx=F2.max===""?Infinity:+F2.max; hits = hits.filter(h=>h.price!=null && h.price>=mn && h.price<=mx); }
  const byName = (a,b)=>mtgCmp(a.name.toLowerCase(),b.name.toLowerCase())||mtgCmp(a.sk,b.sk);
  const sorters = {name:byName, high:(a,b)=>((b.price||0)-(a.price||0))||byName(a,b), low:(a,b)=>((a.price==null?Infinity:a.price)-(b.price==null?Infinity:b.price))||byName(a,b),
    newset:(a,b)=>mtgCmp(b.sk,a.sk)||byName(a,b), buy:(a,b)=>(b.buyA-a.buyA)||byName(a,b)};
  hits.sort(sorters[F2.sort]||byName);
  MTG.memo.q = {key, list:hits};
  return hits;
}
function mtgSetOptions(cur,ids){
  const groups = new Map(), want = ids ? new Set(ids.concat(cur!=="all"?[cur]:[])) : null;
  MTG.sets.forEach(s=>{ if(want ? !want.has(s.code) : !(s.n||s.sealed)) return; if(!groups.has(s.type)) groups.set(s.type,[]); groups.get(s.type).push(s); });
  const list = [...groups.entries()].map(([t,l])=>({name:MTG_SET_TYPES[t]||mtgCap(t.replace(/_/g," ")), list:l.slice().sort((a,b)=>mtgCmp(b.date,a.date)), latest:l.reduce((m,s)=>s.date>m?s.date:m,"")})).sort((a,b)=>mtgCmp(b.latest,a.latest));
  return `<option value="all">All sets</option>`+list.map(g=>`<optgroup label="${esc(g.name)}">${g.list.map(s=>`<option value="${esc(s.code)}"${cur===s.code?" selected":""}>${esc(s.name)} (${s.year||"n.d."})</option>`).join("")}</optgroup>`).join("");
}
function mtgFilterPop(n){
  const sw = (on,label,fn)=>`<button class="fsw${on?" on":""}" role="switch" aria-checked="${on}" onclick="${fn}"><span>${label}</span><i></i></button>`;
  const opts = (list,cur,all)=>`<option value="all">${all}</option>`+list.map(v=>`<option value="${esc(v)}"${cur===v?" selected":""}>${esc(mtgCap(v))}</option>`).join("");
  return `<div class="fpop" role="dialog" aria-label="Filters">
    <div class="fpop-h"><h3>Filters</h3><button class="icon-btn sm" onclick="toggleFilters(false)" aria-label="Close filters">${ic("x",15)}</button></div>
    <p class="muted" style="font-size:13px;margin:0 0 4px">Set, foil, sealed and alternate art are in the bar under the search box.</p>
    <h4>Rarity</h4><select class="dbsel" style="width:100%" aria-label="Rarity" onchange="mxSet({rar:this.value})">${opts(["common","uncommon","rare","mythic","special","bonus"],MX.rar,"Any rarity")}</select>
    <h4>Card type</h4><select class="dbsel" style="width:100%" aria-label="Card type" onchange="mxSet({type:this.value})">${opts(MTG_TYPES,MX.type,"Any type")}</select>
    <h4>Colour</h4><div class="chips-l">${MTG_COLORS.map(([id,l,m])=>`<button class="chip mc mc-${id}${MX.cols.includes(m)?" on":""}" aria-pressed="${MX.cols.includes(m)}" onclick="mxColour(${m})">${l}</button>`).join("")}<button class="chip mc mc-c${MX.none?" on":""}" aria-pressed="${MX.none}" onclick="mxColour(0)">Colourless</button></div>
    <h4>Show only</h4>${sw(MX.buy,"On the Card Kingdom buylist","mxSet({buy:!MX.buy})")}${sw(F2.stock,"Someone nearby has one to trade or sell","setF2({stock:!F2.stock})")}
    <h4>Price</h4><div class="range"><input type="number" min="0" placeholder="Min" aria-label="Minimum price" value="${esc(F2.min)}" onchange="setF2({min:this.value},1)"><span>to</span><input type="number" min="0" placeholder="Max" aria-label="Maximum price" value="${esc(F2.max)}" onchange="setF2({max:this.value},1)"></div>
    <div class="fpop-f"><button class="link" onclick="cfReset('search');mxReset();setF2({type:'All',stock:false,min:'',max:''})">Clear all</button><button class="btn primary" onclick="toggleFilters(false)">Show ${plural(n,"result")}</button></div></div>`;
}
function mtgActiveFilters(){
  const f = cfState("search");
  return [f.set!=="all"&&MTG.setByCode[f.set]&&["cf:set",MTG.setByCode[f.set].name], ...CF_KEYS.map(x=>f[x]&&["cf:"+x,x==="holo"?"Foil":CF_LABEL[x]]),
    MX.rar!=="all"&&["mx:rar",mtgCap(MX.rar)], MX.type!=="all"&&["mx:type",MX.type], ...MX.cols.map(m=>["mx:col"+m,MTG_COLORS.find(c=>c[2]===m)[1]]), MX.none&&["mx:none","Colourless"],
    MX.buy&&["mx:buy","On the buylist"], F2.stock&&["stock","Someone nearby has one"],
    (F2.min!==""||F2.max!=="")&&["price",F2.min!==""&&F2.max!==""?`${money(+F2.min)} to ${money(+F2.max)}`:F2.min!==""?`${money(+F2.min)} and up`:`Up to ${money(+F2.max)}`]].filter(Boolean);
}
function mtgClearFilter(id){
  if(id.indexOf("cf:")===0){ const x=id.slice(3), f=cfState("search"); if(x==="set") f.set="all"; else f[x]=false; }
  else if(id==="mx:rar") MX.rar="all"; else if(id==="mx:type") MX.type="all"; else if(id==="mx:none") MX.none=false; else if(id==="mx:buy") MX.buy=false;
  else if(id.indexOf("mx:col")===0) MX.cols=MX.cols.filter(m=>m!==+id.slice(6));
  else if(id==="price"){ F2.min=""; F2.max=""; } else if(id==="stock") F2.stock=false;
  setF2({});
}

/* ---------- Search: Magic tiles and rows ---------- */
function mtgFace(c,sm){
  const hue = c.h!==undefined ? c.h : mtgHue(c.col), name = c.n||c.name, ch = esc((name[0]||"?").toUpperCase()), set = c.set&&c.set.name?c.set.name:c.set;
  return sm ? `<div class="cf sm" style="--h:${hue}"><span class="cf-art"><i>${ch}</i></span></div>`
    : `<div class="cf${c.foil?" holo":""}" style="--h:${hue}" role="img" aria-label="${esc(name)}"><span class="cf-top">${esc(name)}</span><span class="cf-art"><i>${ch}</i></span><span class="cf-foot">${esc(set)}</span></div>`;
}
const mtgRarTag = r=>`<span class="tag mr-${esc(r)}">${esc(mtgCap(r))}</span>`;
function mtgTile(c){
  const k = mtgKeyOf(c), sellers = CARDS[k] ? PARTIES().filter(p=>p.cards[k]==="sell").length : 0;
  return `<button class="tile" onclick="mtgOpenPrinting(${c.i})"><span class="tile-art tilt">${mtgFace(c)}${c.price?`<span class="sticker">${mtgMoney(c.price)}</span>`:""}</span>
    <span class="tile-b"><b>${esc(c.name)}</b><span class="tile-s">${esc(c.set.name)}, #${esc(c.num)}</span>
    <span class="tile-t">${mtgRarTag(c.rar)}${c.v?`<span class="tag">${esc(c.v)}</span>`:""}${c.p[1]&&c.p[0]?`<span class="tag">Foil ${mtgMoney(c.p[1])}</span>`:""}${c.price?"":`<span class="tag">No price</span>`}${sellers?`<span class="tag">${sellers} selling</span>`:""}${me.wants.includes(k)?`<span class="tag want">On your want list</span>`:""}</span></span></button>`;
}
function mtgRow(c){
  const k = mtgKeyOf(c);
  return `<tr tabindex="0" onclick="mtgOpenPrinting(${c.i})" onkeydown="if(event.key==='Enter')mtgOpenPrinting(${c.i})"><td><span class="tcell"><span class="fw sm">${mtgFace(c,true)}</span><span><b>${esc(c.name)}</b><em>${esc(c.line)}</em></span></span></td>
    <td>${esc(c.set.name)}<em class="mtgnum">#${esc(c.num)}</em></td><td>${mtgRarTag(c.rar)}${c.v?` <span class="tag">${esc(c.v)}</span>`:""}${me.wants.includes(k)?` <span class="tag want">Wanted</span>`:""}</td>
    <td class="num" title="${mtgUsd(c.p[0])}">${mtgMoney(c.p[0])}</td><td class="num" title="${mtgUsd(c.p[1])}">${mtgMoney(c.p[1])}</td><td class="num" title="${mtgUsd(c.buy)}">${mtgMoney(c.buy)}</td></tr>`;
}
const mtgSealTile = x=>`<button class="tile" onclick="openMtgSealed(${x.i})"><span class="tile-art"><div class="cf" style="--h:${hashHue(x.name)}"><span class="cf-top">${esc(x.name)}</span><span class="cf-art">${ic("tag",30)}</span><span class="cf-foot">${esc(x.kind)}</span></div></span>
  <span class="tile-b"><b>${esc(x.name)}</b><span class="tile-s">${esc(x.set?x.set.name:"No set")}</span>
  <span class="tile-t">${x.price?`<span class="tag">${mtgMoney(x.price)}</span>`:`<span class="tag">No price</span>`}${SEALSELL.items[-x.id]?`<span class="tag hit">You're selling this</span>`:""}</span></span></button>`;
const mtgSealRow = x=>`<tr tabindex="0" onclick="openMtgSealed(${x.i})" onkeydown="if(event.key==='Enter')openMtgSealed(${x.i})"><td><span class="tcell"><span class="fw sm"><div class="cf sm" style="--h:${hashHue(x.name)}"><span class="cf-art">${ic("tag",16)}</span></div></span><span><b>${esc(x.name)}</b><em>${esc(x.kind)}</em></span></span></td><td>${esc(x.set?x.set.name:"No set")}</td><td></td>
  <td class="num" title="${mtgUsd(x.price)}">${mtgMoney(x.price)}</td><td class="num">–</td><td class="num" title="${mtgUsd(x.buy)}">${mtgMoney(x.buy)}</td></tr>`;

/* ---------- detail views ---------- */
let MCM = {k:null, e:null, c:null, v:null};
function mtgOpenPrinting(i){ const c=MTG.cards[i]; if(!c) return; const k=mtgKeyOf(c); mtgShow(k, CARDS[k]&&CARDS[k].game==="mtg" ? Object.assign({},CARDS[k],mtgEntry(c)) : mtgEntry(c), c, null); }
function mtgOpenKey(k,v){ const e=CARDS[k], c=MTG.state==="ready"?MTG.byMid.get(e.mid):null; mtgShow(k, c?Object.assign({},e,mtgEntry(c)):e, c||null, v); }
function mtgShow(k,e,c,v){
  const vs = mtgVariantsOf(Object.assign({},e,{vs:null}));
  MCM = {k, e, c, v:v&&vs.some(x=>x.id===v)?v:(me.vars[k]&&vs.some(x=>x.id===me.vars[k])?me.vars[k]:vs[0].id)};
  renderMtgModal();
}
function mtgSetFinish(v){ MCM.v=v; renderMtgModal(); }
function renderMtgModal(){
  const {k,e,c,v} = MCM, vs = mtgVariantsOf(Object.assign({},e,{vs:null})), cur = vs.find(x=>x.id===v)||vs[0];
  const i = MTG_FINISHES.findIndex(f=>f[0]===cur.id), sell = e.usd[i]||0, buy = e.buy[i]||0, have = CARDS[k]&&CARDS[k].game==="mtg";
  const holders = have ? PARTIES().filter(p=>p.cards[k]&&p.cards[k]!=="own") : [];
  const others = c ? (MTG.byName.get(c.ni)||[]).filter(x=>x!==c).sort((a,b)=>b.price-a.price||mtgCmp(b.sk,a.sk)) : [];
  const finRows = MTG_FINISHES.map(([,l],j)=>[l,e.usd[j],e.buy[j]]).filter(r=>r[1]||r[2]);
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button>
  <div class="mdl-card cardm"><div class="cm-art"><div class="tilt">${mtgFace(Object.assign({},e,{foil:cur.id!=="nf"&&sell>0}))}</div><p class="muted" style="text-align:center;margin-top:10px">${esc(cur.label)}</p></div>
  <div class="mdl-info"><h2>${esc(e.n)}</h2><p class="muted">${esc(e.set)}, #${esc(e.mid.split("|")[1])}, ${esc(mtgCap(e.rar))}${e.var?", "+esc(e.var):""}</p>${c?`<p class="muted" style="margin-top:2px">${esc(c.line)}</p>`:""}
    <div class="chips-l"><span class="vchip gm" style="margin:0">MTG</span>${me.cards[k]?`<span class="tag hit">In your binder</span>`:""}${me.wants.includes(k)?`<span class="tag want">On your want list</span>`:""}</div>
    ${vs.length>1?`<div class="tabs sm" role="tablist" aria-label="Finish">${vs.map(x=>`<button role="tab" class="tab${cur.id===x.id?" on":""}" aria-selected="${cur.id===x.id}" onclick="mtgSetFinish('${x.id}')">${x.label}<i>${mtgMoney(e.usd[MTG_FINISHES.findIndex(f=>f[0]===x.id)])}</i></button>`).join("")}</div>`:""}
    <div class="cm-price">${sell?`<span class="sticker big">${mtgMoney(sell)}</span><span class="muted">${buy?`Card Kingdom pays ${mtgMoney(buy)} on its buylist`:"Not on Card Kingdom's buylist"}</span>`:`<span class="muted">Card Kingdom doesn't list this printing, so there's no price for it.</span>`}</div>
    ${finRows.length?`<table class="ptable"><thead><tr><th>Finish</th><th class="num">Card Kingdom sells</th><th class="num">Card Kingdom buys</th></tr></thead><tbody>${finRows.map(([l,p,b])=>`<tr><td>${esc(l)}</td><td class="num" title="${mtgUsd(p)}">${mtgMoney(p)}</td><td class="num" title="${mtgUsd(b)}">${mtgMoney(b)}</td></tr>`).join("")}</tbody></table>`:""}
    <p class="note">Card Kingdom's prices, converted from US dollars at US$1 = A$${PRICE_META.usdToAud}${MTG.meta.built?` (${esc(MTG.meta.built)})`:""}. Hover a price for the US figure.</p>
    ${sell?`<div class="mdl-actions left"><button class="btn primary" data-autofocus onclick="mtgAct('want')">${me.wants.includes(k)?"Remove from want list":"Add to want list"}</button>${me.cards[k]?`<button class="btn" onclick="mtgAct('sell')">${me.cards[k]==="sell"?"Edit my listing, "+money(askOf(k)):"Sell mine"}</button>`:`<button class="btn" onclick="mtgAct('own')">Add to my binder</button>`}</div>`:""}</div></div>
  ${holders.length?`<h3 class="sub">Who has one</h3><div class="holders">${holders.map(p=>{ const st=p.cards[k], l=st==="sell"?listings().find(x=>x.id===p.id+"|"+k):null;
    return `<div class="lrow">${av(p)}<div><b>${p.name}</b><span>${p.store?"Partner store":p.suburb}, ${kmTxt(km(me,p))} away, ${st==="sell"?"selling":"will trade"} ${vOf(k,p.vars[k]).short}</span></div><span class="val">${money(valOf(k,p.vars[k]))}</span>${l?`<button class="btn sm primary" onclick="openListing('${l.id}')">${l.seller.store?"Reserve":"Buy"} at ${money(l.price)}</button>`:`<button class="btn sm" onclick="tradeWith('${p.id}')">Offer a trade</button>`}</div>`; }).join("")}</div>`:""}
  ${others.length?`<h3 class="sub">Other printings (${others.length})</h3>${others.slice(0,6).map(x=>`<button class="lrow" onclick="mtgOpenPrinting(${x.i})"><span class="fw sm">${mtgFace(x,true)}</span><div><b>${esc(x.set.name)}</b><span>#${esc(x.num)}${x.v?", "+esc(x.v):""}</span></div><span class="val">${x.price?mtgMoney(x.price):"No price"}</span></button>`).join("")}
    ${others.length>6?`<button class="link" style="margin-top:8px" onclick="mtgShowAll(${c.i})">See all ${others.length+1} printings${ic("chev",14)}</button>`:""}`:""}`,{wide:true,label:e.n});
}
// the buttons in the detail view register the card first, since a printing only becomes a marketplace card once it's used
function mtgAct(act){
  const {k,e} = MCM; if(!CARDS[k]) CARDS[k] = e;
  if(act==="want") toggleWant(k); else if(act==="own") ownCard(k,MCM.v); else if(act==="sell"){ LD.k=null; openListCard(k); return; }
  renderMtgModal();
}
function mtgShowAll(i){ const c=MTG.cards[i]; if(!c) return; closeModal(); mxReset(); cfReset("search"); Object.assign(F2,{q:c.name,sort:"high",min:"",max:"",stock:false,limit:24}); if(GM.game!=="mtg") setGame("mtg"); go("search"); }
function openMtgSealed(i){
  const x = MTG.sealed[i]; if(!x) return;
  const mine = SEALSELL.items[-x.id];
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <h2>${esc(x.name)}</h2><p class="muted">${esc(x.set?x.set.name:"No set")} · ${esc(x.kind)}</p>
    ${x.price||x.buy?`<table class="ptable" style="margin-top:14px"><thead><tr><th>Product</th><th class="num">Card Kingdom sells</th><th class="num">Card Kingdom buys</th></tr></thead><tbody><tr><td>Sealed</td><td class="num" title="${mtgUsd(x.price)}">${mtgMoney(x.price)}</td><td class="num" title="${mtgUsd(x.buy)}">${mtgMoney(x.buy)}</td></tr></tbody></table>
      <p class="note">Card Kingdom's prices, converted from US dollars at US$1 = A$${PRICE_META.usdToAud}. Hover a price for the US figure.</p>`:`<p class="note">Card Kingdom doesn't list this product, so there's no price for it.</p>`}
    ${mine?`<p>You're already selling this for ${money(mine.ask)}${mine.qty>1?" each":""}.</p>`:""}
    <div class="mdl-actions left"><button class="btn primary" data-autofocus onclick="openListSealed(${-x.id})">${mine?"Edit your listing":"List this to sell"}</button><button class="btn" onclick="closeModal()">Close</button></div></div>`,{label:x.name});
}

/* ---------- the other card searches: list an item, add a card, trade nights ---------- */
// Magic printings you can list or add have a Card Kingdom price, since that price is the card's market value
function mtgMatches(words,f,limit,pred){
  const out = [];
  for(const c of MTG.cards){
    if(!c.price) continue;
    if(f.set!=="all" && c.set.code!==f.set) continue;
    if(f.holo && !(c.p[1]||c.p[2])) continue;
    if(f.alt && !c.alt) continue;
    let ok = true; for(const w of words) if(!c.hay.includes(w)){ ok = false; break; }
    if(!ok || (pred && !pred(c))) continue;
    out.push(c); if(out.length>=400) break;
  }
  return out.sort((a,b)=>psRank(a.name,words)-psRank(b.name,words)||b.price-a.price).slice(0,limit);
}
function mtgPsQuery(q){
  const box = document.getElementById("ps-res"); if(!box) return;
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean), f = cfState("list");
  psOwned();
  if(!words.length && !cfActive(f)){ box.innerHTML=""; return; }
  const rows = [];
  if(!f.sealed && !f.graded) mtgMatches(words,f,6).forEach(c=>rows.push(`<button class="dbhit" onclick="mtgPickToSell(${c.i})"><b>${esc(c.name)}</b><span>${esc(c.set.name)} · #${esc(c.num)}${c.v?" · "+esc(c.v):""} · ${mtgMoney(mtgFirst(c))}</span></button>`));
  if(!(f.holo||f.alt||f.graded)){
    const sx = MTG.sealed.filter(x=>x.price&&(f.set==="all"||(x.set&&x.set.code===f.set))&&words.every(w=>x.hay.includes(w))).slice(0,6);
    sx.forEach(x=>rows.push(`<button class="dbhit" onclick="openListSealed(${-x.id})"><b>${esc(x.name)}</b><span>${esc(x.set?x.set.name:"No set")} · ${esc(x.kind)} · ${mtgMoney(x.price)}</span></button>`));
  }
  box.innerHTML = rows.length ? rows.join("") : `<p class="muted dbhint">Nothing matches. Try fewer words${cfActive(f)?" or clear a filter":""}. Only items Card Kingdom prices can be listed.</p>`;
}
function mtgPickToSell(i){ const c=MTG.cards[i]; if(!c) return; const k=mtgEnsure(c); closeModal(); LD.k=null; openListCard(k); }
function mtgAddResults(words,f){
  return mtgMatches(words,f,8).map(c=>{ const k=mtgKeyOf(c);
    return `<div class="prow static"><span class="fw sm">${mtgFace(c,true)}</span><span><b>${esc(c.name)}</b><em>${esc(c.set.name)}, #${esc(c.num)}${c.v?", "+esc(c.v):""}</em></span><span class="val">${mtgMoney(mtgFirst(c))}</span>
      <button class="btn sm" ${me.cards[k]?"disabled":""} onclick="mtgAdd(${c.i},'own')">${me.cards[k]?"In binder":"Add to binder"}</button><button class="btn sm" onclick="mtgAdd(${c.i},'want')">${me.wants.includes(k)?"On want list":"Add to want list"}</button></div>`; }).join("");
}
function mtgAddCard(q){
  const head = `<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>Add a card</h2>${gameSwitch()}`;
  if(MTG.state!=="ready"){
    if(MTG.state!=="error") mtgLoad(()=>{ const m=$("#modal"); if(m && m.classList.contains("on")) openAddCard(); });
    openModal(head+mtgGateBody("openAddCard()")+`</div>`,{label:"Add a card"});
    MODAL_KIND = "add"; return;
  }
  if(q!=null) addQ = q;
  const words = addQ.trim().toLowerCase().split(/\s+/).filter(Boolean), f = cfState("add"), looking = words.length || cfActive(f), hits = looking ? mtgAddResults(words,f) : "";
  openModal(head+`<p class="muted">Search any Magic card, then add it to your binder or your want list.</p>
    <div class="bigsearch" style="margin:14px 0"><input id="aq" data-autofocus placeholder="Search by name, set or number" autocomplete="off" value="${esc(addQ)}" oninput="addQ=this.value;openAddCard()" aria-label="Search cards"></div>
    ${cfBar("add",()=>openAddCard(),{noSealed:"Only cards go in a binder or want list",gradedTip:"Card Kingdom doesn't sell graded cards"})}
    ${hits||(looking?`<p class="muted">Nothing matches that${cfActive(f)?". Try clearing a filter":""}. Only cards Card Kingdom prices can be added.</p>`:"")}</div>`,{label:"Add a card"});
  MODAL_KIND = "add"; const n = $("#aq"); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); }
}
function mtgAdd(i,what){ const c=MTG.cards[i]; if(!c) return; const k=mtgEnsure(c); if(what==="own") ownCard(k); else toggleWant(k); openAddCard(); }
function mtgNightSearch(key,q){
  const box = $("#nres"); if(!box) return;
  if(MTG.state!=="ready"){ box.innerHTML = mtgGateBody("render()"); return; }
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean), f = cfState("night"), p = nightPlan(key);
  if(!words.length && !cfActive(f)){ box.innerHTML=""; return; }
  const hits = mtgMatches(words,f,6,c=>{ const k=mtgKeyOf(c); return !p.seek.includes(k) && !me.wants.includes(k); });
  box.innerHTML = hits.length ? hits.map(c=>`<button class="prow" onclick="mtgNightAdd('${key}',${c.i})"><span class="fw sm">${mtgFace(c,true)}</span><span><b>${esc(c.name)}</b><em>${esc(c.set.name)}, #${esc(c.num)}</em></span><span class="val">${mtgMoney(mtgFirst(c))}</span><span class="add">${ic("plus",14)}Add</span></button>`).join("")
    : `<p class="muted" style="padding:8px 0">No card by that name${cfActive(f)?" with these filters":""}, or it's already on your list. Only cards Card Kingdom prices can be added.</p>`;
}
function mtgNightAdd(key,i){ const c=MTG.cards[i]; if(!c) return; toggleIn(key,"seek",mtgEnsure(c)); }

/* ---------- sample Magic holdings ----------
   Card names are looked up in the data and given a real printing and its Card Kingdom price, so the sample collectors, stores and
   demo profiles have Magic binders, want lists and listings (and trades with each other). A name the data doesn't have is skipped. */
const MTG_SEED = {
  marcus:{cards:{"Rhystic Study":"trade","Mana Drain":"sell","Counterspell":"trade","Lightning Bolt":"own"}, wants:["Sol Ring","Swords to Plowshares"]},
  aisha:{cards:{"Swords to Plowshares":"trade","Llanowar Elves":"sell","Birds of Paradise":"trade"}, wants:["Cyclonic Rift","Counterspell"]},
  dan:{cards:{"Sol Ring":"sell","Lightning Bolt":"sell","Dark Ritual":"sell","Arcane Signet":"sell"}, wants:["The One Ring","Force of Will","Rhystic Study"]},
  priya:{cards:{"Cyclonic Rift":"trade","Arcane Signet":"sell"}, wants:["Swords to Plowshares","Dark Ritual","Birds of Paradise"]},
  tom:{cards:{"Force of Will":"trade","Mana Drain":"trade","Dark Ritual":"trade"}, wants:["Sol Ring","Ragavan, Nimble Pilferer","Lightning Bolt"]},
  lena:{cards:{"Ragavan, Nimble Pilferer":"sell","Orcish Bowmasters":"trade","The One Ring":"trade"}, wants:["Counterspell","Sol Ring","Llanowar Elves"]},
  sam:{cards:{"Sheoldred, the Apocalypse":"sell","Snapcaster Mage":"trade","Llanowar Elves":"trade"}, wants:["Mana Drain","Rhystic Study"]},
  holohall:{cards:{"Sol Ring":"sell","Counterspell":"sell","Rhystic Study":"sell"}, wants:["Force of Will","The One Ring"]},
  topdeck:{cards:{"The One Ring":"sell","Orcish Bowmasters":"sell","Swords to Plowshares":"sell"}, wants:["Sol Ring","Lightning Bolt"]},
  slab:{cards:{"Mana Drain":"sell","Force of Will":"sell"}, wants:["Ragavan, Nimble Pilferer","Rhystic Study"]},
  jonah:{cards:{"Sol Ring":"trade","Lightning Bolt":"trade","Counterspell":"own","Llanowar Elves":"sell","Cyclonic Rift":"trade"}, wants:["Rhystic Study","Swords to Plowshares","The One Ring","Mana Drain"]},
  ella:{cards:{"Swords to Plowshares":"trade","Rhystic Study":"trade","Birds of Paradise":"sell","Dark Ritual":"trade","Arcane Signet":"own"}, wants:["Sol Ring","Counterspell","Lightning Bolt","Mana Drain"]},
  chris:{cards:{"The One Ring":"trade","Ragavan, Nimble Pilferer":"trade","Orcish Bowmasters":"sell","Force of Will":"own","Cyclonic Rift":"trade"}, wants:["Sol Ring","Swords to Plowshares","Counterspell","Rhystic Study"]}
};
// the printing the samples use for a card name: a current, plain printing from a standard set that Card Kingdom prices
function mtgPick(name){
  const i = MTG.nameIdx.get(name.toLowerCase()); if(i==null) return null;
  const all = (MTG.byName.get(i)||[]).filter(c=>c.p[0]); if(!all.length) return null;
  return all.sort((a,b)=>(MTG_STD_SETS.has(b.set.type)-MTG_STD_SETS.has(a.set.type))||((a.v?1:0)-(b.v?1:0))||mtgCmp(b.sk,a.sk))[0];
}
function mtgSeedOwner(o,spec){
  Object.keys(spec.cards).forEach(name=>{
    const c = mtgPick(name); if(!c) return;
    const k = mtgEnsure(c); o.cards[k] = spec.cards[name]; o.vars = o.vars||{}; o.vars[k] = mtgVariantsOf(CARDS[k])[0].id;
    if(o===me && spec.cards[name]==="sell") SELL.ask[k] = askRound(k,valOf(k,o.vars[k]));
  });
  spec.wants.forEach(name=>{ const c = mtgPick(name); if(!c) return; const k = mtgEnsure(c); if(!o.wants.includes(k)) o.wants.push(k); });
}
function mtgSeed(){
  const saved = id=>{ try{ const s=JSON.parse(localStorage.getItem(pkeyFor(PROFILES.find(p=>p.id===id),"binderloop.web.sell.v1"))||"null"); return !!(s&&s.mtgSeeded); }catch(e){ return false; } };
  [...USERS,...STORES].forEach(o=>{ const spec = MTG_SEED[o.id]; if(spec && !(o.demo && saved(o.id))) mtgSeedOwner(o,spec); });
  if(!SELL.mtgSeeded){ mtgSeedOwner(me,MTG_SEED[PROFILE.id]||{cards:{},wants:[]}); SELL.mtgSeeded = true; saveSell(); }
}
