/* =====================================================================
   Magic: The Gathering price database, under "Magic" in the app: every paper
   printing and sealed product, priced from Card Kingdom (what it sells for and
   what it pays, in USD, shown in AUD at the site's rate). Loads data/mtg.js the
   first time the page opens. Loaded after card-filters.js.

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
const MTG = {state:"idle", meta:{}, sets:[], cards:[], sealed:[], kinds:[], waiters:[], memo:{}};
const MG = {q:"", set:"all", rar:"all", type:"all", fin:"all", cols:[], none:false, buy:false, priced:false, min:"", max:"", sort:"high", view:"table", limit:30};
const MS = {q:"", set:"all", kind:"all", buy:false, min:"", max:"", sort:"high", limit:30};
const MTG_COLORS = [["w","White",1],["u","Blue",2],["b","Black",4],["r","Red",8],["g","Green",16]];
const MTG_HUE = {1:48,2:212,4:272,8:6,16:122}, MTG_MULTI_HUE = 42, MTG_NONE_HUE = 200;
const MTG_TYPES = ["Creature","Instant","Sorcery","Artifact","Enchantment","Planeswalker","Land","Battle","Kindred"];
const MTG_TYPE_RX = MTG_TYPES.map(t=>new RegExp("\\b"+(t==="Kindred"?"(Kindred|Tribal)":t)+"\\b"));
const MTG_FIN = [["nonfoil","Normal"],["foil","Foil"],["etched","Etched foil"]];
const MTG_SET_TYPES = {core:"Core sets", expansion:"Expansions", masters:"Masters and reprint sets", draft_innovation:"Draft innovation", commander:"Commander",
  starter:"Starter and intro", box:"Box sets", funny:"Un-sets", promo:"Promos", duel_deck:"Duel decks", from_the_vault:"From the Vault", premium_deck:"Premium decks",
  planechase:"Planechase", archenemy:"Archenemy", spellbook:"Spellbooks", treasure_chest:"Treasure chests", alchemy:"Alchemy", memorabilia:"Memorabilia",
  token:"Tokens", minigame:"Minigames", vanguard:"Vanguard"};
const MTG_PAGE = 30;
const mtgCmp = (a,b)=>a<b?-1:a>b?1:0;
const mtgPad = n=>String(n).replace(/\d+/g,m=>m.padStart(4,"0"));
const mtgCap = s=>s.charAt(0).toUpperCase()+s.slice(1);
const mtgCount = (n,w)=>n.toLocaleString()+" "+(n===1?w:w+"s");
const mtgAud = c=>Math.round(c*PRICE_META.usdToAud)/100;
const mtgMoney = c=>c?money(mtgAud(c)):"–";
const mtgUsd = c=>c?"US$"+(c/100).toFixed(2):"";
const mtgTab = ()=>S.tab==="sealed"?"sealed":"singles";
const mtgRerender = ()=>{ if(S.view==="app" && S.page==="mtg") render(); };

/* ---------- loading ---------- */
function mtgLoad(cb){
  if(MTG.state==="ready"){ if(cb) cb(); return; }
  if(cb && !MTG.waiters.includes(cb)) MTG.waiters.push(cb);
  if(MTG.state==="loading") return;
  if(window.__MTG){ mtgInit(window.__MTG); return; }
  MTG.state = "loading";
  const s = document.createElement("script"); s.src = "data/mtg.js?v="+(window.BL_V||"");
  s.onload = () => { if(window.__MTG) mtgInit(window.__MTG); else { MTG.state = "error"; mtgRerender(); } };
  s.onerror = () => { s.remove(); MTG.state = "error"; mtgRerender(); };
  document.head.appendChild(s);
}
function mtgInit(d){
  try{
    MTG.meta = {built:d.built, source:d.source, priced:0};
    MTG.kinds = d.kinds || [];
    MTG.sets = d.sets.map((s,i) => ({i, code:s[0], name:s[1], type:s[2], date:s[3], year:Number(String(s[3]).slice(0,4))||0, n:0, sealed:0}));
    const mask = d.lines.map(l => MTG_TYPE_RX.reduce((m,rx,i) => m | (rx.test(l) ? 1<<i : 0), 0));
    MTG.cards = d.cards.map((r,i) => {
      const s = MTG.sets[r[0]], name = d.names[r[2]], line = d.lines[r[4]], p = r[6], b = r[7] || [0,0,0], v = d.vars[r[8]||0] || "";
      const c = {i, set:s, num:String(r[1]), name, ni:r[2], rar:d.rar[r[3]], line, col:r[5], tm:mask[r[4]], p, b, v, price:p[0]||p[1]||p[2]||0, buy:b[0]||b[1]||b[2]||0};
      c.hay = [name, s.name, s.code, c.num, line, c.rar, v].join(" ").toLowerCase();
      c.nk = name.toLowerCase()+"|"+s.date+"|"+mtgPad(c.num);
      c.sk = s.date+"|"+s.code+"|"+mtgPad(c.num);
      s.n++; if(c.price) MTG.meta.priced++;
      return c;
    });
    MTG.sealed = d.sealed.map((r,i) => {
      const s = r[3]>=0 ? MTG.sets[r[3]] : null, x = {i, id:r[0], name:r[1], kind:d.kinds[r[2]], set:s, price:r[4]||0, buy:r[5]||0};
      x.hay = [x.name, s?s.name:"", s?s.code:"", x.kind].join(" ").toLowerCase();
      x.nk = x.name.toLowerCase(); x.sk = (s?s.date:"0000")+"|"+x.nk;
      if(s) s.sealed++;
      return x;
    });
    MTG.state = "ready";
    MTG.waiters.splice(0).forEach(f => { try{ f(); }catch(e){} });
  }catch(e){ console.error("Magic data didn't load", e); MTG.state = "error"; mtgRerender(); }
}

/* ---------- searching, filtering and sorting (results are cached until a filter changes) ---------- */
function mtgSingles(){
  const st=MG, key=JSON.stringify([st.q,st.set,st.rar,st.type,st.fin,st.cols,st.none,st.buy,st.priced,st.min,st.max,st.sort]);
  if(MTG.memo.s && MTG.memo.s.key===key) return MTG.memo.s.list;
  const words=st.q.trim().toLowerCase().split(/\s+/).filter(Boolean), fi=MTG_FIN.findIndex(f=>f[0]===st.fin), pf=fi<0?(c=>c.price):(c=>c.p[fi]);
  const tb=st.type==="all"?0:1<<MTG_TYPES.indexOf(st.type), cm=st.cols.reduce((m,x)=>m|x,0);
  const range=st.min!==""||st.max!=="", mn=st.min===""?0:+st.min, mx=st.max===""?Infinity:+st.max;
  const list=MTG.cards.filter(c=>{
    if(st.set!=="all" && c.set.code!==st.set) return false;
    if(st.rar!=="all" && c.rar!==st.rar) return false;
    if(tb && !(c.tm&tb)) return false;
    if(st.none ? c.col!==0 : cm && (c.col&cm)!==cm) return false;
    if(st.buy && !c.buy) return false;
    if(fi>=0 || st.priced || range){ const p=pf(c); if(!p || mtgAud(p)<mn || mtgAud(p)>mx) return false; }
    for(const w of words) if(!c.hay.includes(w)) return false;
    return true;
  });
  const byName=(a,b)=>mtgCmp(a.nk,b.nk);
  const sorters={high:(a,b)=>pf(b)-pf(a)||byName(a,b), low:(a,b)=>(pf(a)||Infinity)-(pf(b)||Infinity)||byName(a,b), buy:(a,b)=>b.buy-a.buy||byName(a,b),
    name:byName, new:(a,b)=>mtgCmp(b.sk,a.sk), old:(a,b)=>mtgCmp(a.sk,b.sk)};
  list.sort(sorters[st.sort]||byName);
  MTG.memo.s = {key,list};
  return list;
}
function mtgSealedList(){
  const st=MS, key=JSON.stringify([st.q,st.set,st.kind,st.buy,st.min,st.max,st.sort]);
  if(MTG.memo.x && MTG.memo.x.key===key) return MTG.memo.x.list;
  const words=st.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const range=st.min!==""||st.max!=="", mn=st.min===""?0:+st.min, mx=st.max===""?Infinity:+st.max;
  const list=MTG.sealed.filter(x=>{
    if(st.set!=="all" && (!x.set || x.set.code!==st.set)) return false;
    if(st.kind!=="all" && x.kind!==st.kind) return false;
    if(st.buy && !x.buy) return false;
    if(range && (!x.price || mtgAud(x.price)<mn || mtgAud(x.price)>mx)) return false;
    for(const w of words) if(!x.hay.includes(w)) return false;
    return true;
  });
  const byName=(a,b)=>mtgCmp(a.nk,b.nk);
  const sorters={high:(a,b)=>b.price-a.price||byName(a,b), low:(a,b)=>(a.price||Infinity)-(b.price||Infinity)||byName(a,b), buy:(a,b)=>b.buy-a.buy||byName(a,b),
    name:byName, new:(a,b)=>mtgCmp(b.sk,a.sk)};
  list.sort(sorters[st.sort]||byName);
  MTG.memo.x = {key,list};
  return list;
}
// every printing of one card, for the detail view
function mtgPrintings(c){
  if(!MTG.byName){ MTG.byName=new Map(); MTG.cards.forEach(x=>{ let a=MTG.byName.get(x.ni); if(!a) MTG.byName.set(x.ni,a=[]); a.push(x); }); }
  return MTG.byName.get(c.ni);
}

/* ---------- the page ---------- */
function mtgPage(){
  const head=pageHead("Magic: The Gathering","Every card printing and sealed product, priced from Card Kingdom.");
  if(MTG.state==="error") return head+emptyBox("The Magic database isn't on this site yet","The file data/mtg.js wasn't found, or it couldn't be read.",`<button class="btn primary" onclick="MTG.state='idle';render()">Try again</button>`);
  if(MTG.state!=="ready"){
    mtgLoad(()=>mtgRerender());
    return head+`<div class="empty" role="status"><b>Loading the Magic database…</b><p>Every card and sealed product. This only happens the first time.</p></div>`;
  }
  const tabs=tabBar("mtg",[["singles","Singles",MTG.cards.length.toLocaleString()],["sealed","Sealed",MTG.sealed.length.toLocaleString()]]);
  return head+tabs+(mtgTab()==="sealed"?mtgSealedPage():mtgSinglesPage())+mtgFoot();
}
function mtgFoot(){
  const m=MTG.meta;
  return `<p class="note mtgnote">${m.source?esc(m.source)+". ":""}Prices as of ${esc(m.built||"the last update")}, in Australian dollars at US$1 = A$${PRICE_META.usdToAud}. "Buylist" is what Card Kingdom pays, so it's always below what it sells for.
    Magic: The Gathering is a trademark of Wizards of the Coast. Binder Loop isn't affiliated with or endorsed by Wizards of the Coast or Card Kingdom.</p>`;
}
function mtgFace(c,sm){
  const hue=c.col===0?MTG_NONE_HUE:MTG_HUE[c.col]||MTG_MULTI_HUE, ch=esc((c.name[0]||"?").toUpperCase());
  return sm ? `<div class="cf sm" style="--h:${hue}"><span class="cf-art"><i>${ch}</i></span></div>`
    : `<div class="cf" style="--h:${hue}" role="img" aria-label="${esc(c.name)}"><span class="cf-top">${esc(c.name)}</span><span class="cf-art"><i>${ch}</i></span><span class="cf-foot">${esc(c.set.name)}</span></div>`;
}
const mtgRarTag = r=>`<span class="tag mr-${esc(r)}">${esc(mtgCap(r))}</span>`;
function mtgSetOptions(cur,count){
  const groups=new Map();
  MTG.sets.forEach(s=>{ if(!s[count]) return; if(!groups.has(s.type)) groups.set(s.type,[]); groups.get(s.type).push(s); });
  const list=[...groups.entries()].map(([t,l])=>({name:MTG_SET_TYPES[t]||mtgCap(t.replace(/_/g," ")), list:l.slice().sort((a,b)=>mtgCmp(b.date,a.date)), latest:l.reduce((m,s)=>s.date>m?s.date:m,"")})).sort((a,b)=>mtgCmp(b.latest,a.latest));
  return `<option value="all">All sets</option>`+list.map(g=>`<optgroup label="${esc(g.name)}">${g.list.map(s=>`<option value="${esc(s.code)}"${cur===s.code?" selected":""}>${esc(s.name)} (${s.year||"n.d."})</option>`).join("")}</optgroup>`).join("");
}
const mtgOpts = (list,cur,all)=>`<option value="all">${all}</option>`+list.map(([v,l])=>`<option value="${esc(v)}"${cur===v?" selected":""}>${esc(l)}</option>`).join("");
const mtgPriceRange = (st,fn)=>`<span class="range"><input type="number" min="0" placeholder="Min A$" aria-label="Minimum price in Australian dollars" value="${esc(st.min)}" onchange="${fn}({min:this.value},1)"><span>to</span><input type="number" min="0" placeholder="Max A$" aria-label="Maximum price in Australian dollars" value="${esc(st.max)}" onchange="${fn}({max:this.value},1)"></span>`;
const mtgSearchBox = (st,ph)=>`<div class="bigsearch">${ic("search",20)}<input id="mq" placeholder="${ph}" autocomplete="off" value="${esc(st.q)}" aria-label="Search" oninput="mtgQuery(this.value)"></div>`;
const mtgSortSel = (st,opts,fn)=>`<label class="sel">Sort<select onchange="${fn}({sort:this.value})" aria-label="Sort results">${opts.map(([v,l])=>`<option value="${v}"${st.sort===v?" selected":""}>${l}</option>`).join("")}</select></label>`;
// typing re-renders after a short pause, so a 100,000-row search doesn't run on every keystroke
function mtgQuery(v){ const st=mtgTab()==="sealed"?MS:MG; st.q=v; st.limit=MTG_PAGE; clearTimeout(mtgQuery._t); mtgQuery._t=setTimeout(render,160); }
// "later" is for the price boxes: Chrome fires their change event again while render() removes the box, so render once the event has finished
const mtgLater = ()=>{ clearTimeout(mtgLater._t); mtgLater._t=setTimeout(render,0); };
function mgSet(patch,later){ Object.assign(MG,patch,{limit:MTG_PAGE}); later?mtgLater():render(); }
function msSet(patch,later){ Object.assign(MS,patch,{limit:MTG_PAGE}); later?mtgLater():render(); }
function mgColour(m){
  if(m===0){ MG.none=!MG.none; MG.cols=[]; } else { MG.none=false; MG.cols=MG.cols.includes(m)?MG.cols.filter(x=>x!==m):MG.cols.concat(m); }
  MG.limit=MTG_PAGE; render();
}
const mgActive = ()=>MG.set!=="all"||MG.rar!=="all"||MG.type!=="all"||MG.fin!=="all"||MG.cols.length||MG.none||MG.buy||MG.priced||MG.min!==""||MG.max!=="";
const msActive = ()=>MS.set!=="all"||MS.kind!=="all"||MS.buy||MS.min!==""||MS.max!=="";
const mgReset = ()=>Object.assign(MG,{set:"all",rar:"all",type:"all",fin:"all",cols:[],none:false,buy:false,priced:false,min:"",max:"",limit:MTG_PAGE});
function mgClear(){ mgReset(); render(); }
function msClear(){ Object.assign(MS,{set:"all",kind:"all",buy:false,min:"",max:"",limit:MTG_PAGE}); render(); }
const mtgMore = (n,st)=>n>st.limit?`<div class="more-w"><span class="muted">Showing ${st.limit.toLocaleString()} of ${n.toLocaleString()}</span><button class="btn" onclick="${st===MG?"MG":"MS"}.limit+=MTG_PAGE;render()">Show ${MTG_PAGE} more</button></div>`:"";

function mtgSinglesPage(){
  const hits=mtgSingles(), shown=hits.slice(0,MG.limit), chk=(on,fn,l)=>`<button class="chip${on?" on":""}" aria-pressed="${on}" onclick="${fn}">${l}</button>`;
  const bar=`<div class="cfbar" role="group" aria-label="Filters">
      <select class="dbsel cf-set${MG.set!=="all"?" on":""}" aria-label="Set" onchange="mgSet({set:this.value})">${mtgSetOptions(MG.set,"n")}</select>
      <select class="dbsel${MG.rar!=="all"?" on":""}" aria-label="Rarity" onchange="mgSet({rar:this.value})">${mtgOpts(["common","uncommon","rare","mythic","special","bonus"].map(r=>[r,mtgCap(r)]),MG.rar,"Any rarity")}</select>
      <select class="dbsel${MG.type!=="all"?" on":""}" aria-label="Card type" onchange="mgSet({type:this.value})">${mtgOpts(MTG_TYPES.map(t=>[t,t]),MG.type,"Any type")}</select>
      <select class="dbsel${MG.fin!=="all"?" on":""}" aria-label="Finish" onchange="mgSet({fin:this.value})">${mtgOpts(MTG_FIN,MG.fin,"Any finish")}</select>
      ${mtgPriceRange(MG,"mgSet")}</div>
    <div class="cfbar" role="group" aria-label="Colour and price filters">
      ${MTG_COLORS.map(([id,l,m])=>`<button class="chip mc mc-${id}${MG.cols.includes(m)?" on":""}" aria-pressed="${MG.cols.includes(m)}" onclick="mgColour(${m})">${l}</button>`).join("")}
      <button class="chip mc mc-c${MG.none?" on":""}" aria-pressed="${MG.none}" onclick="mgColour(0)">Colourless</button>
      ${chk(MG.priced,"mgSet({priced:!MG.priced})","Has a price")}${chk(MG.buy,"mgSet({buy:!MG.buy})","On the buylist")}
      ${mgActive()?`<button class="link" onclick="mgClear()">Clear</button>`:""}</div>`;
  const row=c=>`<tr tabindex="0" onclick="openMtgCard(${c.i})" onkeydown="if(event.key==='Enter')openMtgCard(${c.i})"><td><span class="tcell"><span class="fw sm">${mtgFace(c,true)}</span><span><b>${esc(c.name)}</b><em>${esc(c.line)}</em></span></span></td>
    <td>${esc(c.set.name)}<em class="mtgnum">#${esc(c.num)}</em></td><td>${mtgRarTag(c.rar)}${c.v?` <span class="tag">${esc(c.v)}</span>`:""}</td>
    <td class="num" title="${mtgUsd(c.p[0])}">${mtgMoney(c.p[0])}</td><td class="num" title="${mtgUsd(c.p[1])}">${mtgMoney(c.p[1])}</td><td class="num" title="${mtgUsd(c.p[2])}">${mtgMoney(c.p[2])}</td><td class="num" title="${mtgUsd(c.buy)}">${mtgMoney(c.buy)}</td></tr>`;
  const tile=c=>`<button class="tile" onclick="openMtgCard(${c.i})"><span class="tile-art tilt">${mtgFace(c)}${c.price?`<span class="sticker">${mtgMoney(c.price)}</span>`:""}</span>
    <span class="tile-b"><b>${esc(c.name)}</b><span class="tile-s">${esc(c.set.name)}, #${esc(c.num)}</span>
    <span class="tile-t">${mtgRarTag(c.rar)}${c.v?`<span class="tag">${esc(c.v)}</span>`:""}${c.p[1]&&c.p[0]?`<span class="tag">Foil ${mtgMoney(c.p[1])}</span>`:""}${c.price?"":`<span class="tag">No price</span>`}</span></span></button>`;
  return mtgSearchBox(MG,"Lightning Bolt, Modern Horizons 3, borderless, 142")+bar
    +`<div class="rbar"><h2>${mtgCount(hits.length,"printing")}</h2><div class="rbar-r">${mtgSortSel(MG,[["high","Price, high to low"],["low","Price, low to high"],["buy","Buylist, high to low"],["name","Name A–Z"],["new","Newest set first"],["old","Oldest set first"]],"mgSet")}
      <div class="viewt" role="group" aria-label="View"><button class="${MG.view==="grid"?"on":""}" aria-pressed="${MG.view==="grid"}" onclick="MG.view='grid';render()" aria-label="Grid view">${ic("grid",17)}</button><button class="${MG.view==="table"?"on":""}" aria-pressed="${MG.view==="table"}" onclick="MG.view='table';render()" aria-label="Table view">${ic("list",17)}</button></div></div></div>`
    +(!hits.length?emptyBox("Nothing matches","Try different words, or remove a filter.")
      :MG.view==="grid"?`<div class="tiles">${shown.map(tile).join("")}</div>`
      :`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Card</th><th>Set</th><th>Rarity</th><th class="num">Normal</th><th class="num">Foil</th><th class="num">Etched</th><th class="num">Buylist</th></tr></thead><tbody>${shown.map(row).join("")}</tbody></table></div>`)
    +mtgMore(hits.length,MG);
}
function mtgSealedPage(){
  const hits=mtgSealedList(), shown=hits.slice(0,MS.limit);
  const bar=`<div class="cfbar" role="group" aria-label="Filters">
      <select class="dbsel cf-set${MS.set!=="all"?" on":""}" aria-label="Set" onchange="msSet({set:this.value})">${mtgSetOptions(MS.set,"sealed")}</select>
      <select class="dbsel${MS.kind!=="all"?" on":""}" aria-label="Kind of product" onchange="msSet({kind:this.value})">${mtgOpts(MTG.kinds.map(k=>[k,k]),MS.kind,"Any kind")}</select>
      ${mtgPriceRange(MS,"msSet")}
      <button class="chip${MS.buy?" on":""}" aria-pressed="${MS.buy}" onclick="msSet({buy:!MS.buy})">On the buylist</button>
      ${msActive()?`<button class="link" onclick="msClear()">Clear</button>`:""}</div>`;
  const row=x=>`<tr tabindex="0" onclick="openMtgSealed(${x.i})" onkeydown="if(event.key==='Enter')openMtgSealed(${x.i})"><td><b>${esc(x.name)}</b></td><td>${esc(x.set?x.set.name:"No set")}</td><td>${esc(x.kind)}</td>
    <td class="num" title="${mtgUsd(x.price)}">${mtgMoney(x.price)}</td><td class="num" title="${mtgUsd(x.buy)}">${mtgMoney(x.buy)}</td></tr>`;
  return mtgSearchBox(MS,"Modern Horizons 3 Play Booster Box, bundle, Commander deck")+bar
    +`<div class="rbar"><h2>${mtgCount(hits.length,"product")}</h2><div class="rbar-r">${mtgSortSel(MS,[["high","Price, high to low"],["low","Price, low to high"],["buy","Buylist, high to low"],["name","Name A–Z"],["new","Newest set first"]],"msSet")}</div></div>`
    +(!hits.length?emptyBox("Nothing matches","Try different words, or remove a filter.")
      :`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Product</th><th>Set</th><th>Kind</th><th class="num">Price</th><th class="num">Buylist</th></tr></thead><tbody>${shown.map(row).join("")}</tbody></table></div>`)
    +mtgMore(hits.length,MS);
}

/* ---------- detail views ---------- */
const mtgPriceTable = rows=>`<table class="ptable" style="margin-top:14px"><thead><tr><th>${rows.label||"Finish"}</th><th class="num">Card Kingdom sells</th><th class="num">Card Kingdom buys</th></tr></thead><tbody>${rows.map(([l,p,b])=>`<tr><td>${esc(l)}</td><td class="num" title="${mtgUsd(p)}">${mtgMoney(p)}</td><td class="num" title="${mtgUsd(b)}">${mtgMoney(b)}</td></tr>`).join("")}</tbody></table>`;
function openMtgCard(i){
  const c=MTG.cards[i]; if(!c) return;
  const rows=MTG_FIN.map(([,l],k)=>[l,c.p[k],c.b[k]]).filter(r=>r[1]||r[2]);
  const others=mtgPrintings(c).filter(x=>x!==c).sort((a,b)=>b.price-a.price||mtgCmp(b.sk,a.sk));
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-card"><div class="tilt">${mtgFace(c)}</div><div class="mdl-info">
    <h2>${esc(c.name)}</h2><p class="muted">${esc(c.set.name)}, #${esc(c.num)}, ${esc(mtgCap(c.rar))}${c.v?", "+esc(c.v):""}</p><p class="muted" style="margin-top:2px">${esc(c.line)}</p>
    ${rows.length?mtgPriceTable(rows)+`<p class="note">Card Kingdom's prices, converted from US dollars at US$1 = A$${PRICE_META.usdToAud}. Hover a price for the US figure.</p>`:`<p class="note" style="margin-top:14px">Card Kingdom doesn't list this printing, so there's no price for it.</p>`}
    ${others.length?`<h3 class="sub" style="margin-top:18px">Other printings (${others.length})</h3>${others.slice(0,8).map(x=>`<button class="lrow" onclick="openMtgCard(${x.i})"><span class="fw sm">${mtgFace(x,true)}</span><div><b>${esc(x.set.name)}</b><span>#${esc(x.num)}${x.v?", "+esc(x.v):""}</span></div><span class="val">${x.price?mtgMoney(x.price):"No price"}</span></button>`).join("")}
      ${others.length>8?`<button class="link" style="margin-top:8px" onclick="mtgShowAll(${c.ni})">See all ${others.length+1} printings${ic("chev",14)}</button>`:""}`:""}
    <div class="mdl-actions left"><button class="btn" data-autofocus onclick="closeModal()">Close</button></div></div></div>`,{wide:true,label:c.name});
}
// search for one card's name, with every other filter cleared
function mtgShowAll(ni){ const c=MTG.cards.find(x=>x.ni===ni); if(!c) return; mgReset(); Object.assign(MG,{q:c.name,sort:"high"}); go("mtg","singles"); }
function openMtgSealed(i){
  const x=MTG.sealed[i]; if(!x) return;
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <h2>${esc(x.name)}</h2><p class="muted">${esc(x.set?x.set.name:"No set")} · ${esc(x.kind)}</p>
    ${x.price||x.buy?mtgPriceTable(Object.assign([["Sealed",x.price,x.buy]],{label:"Product"}))+`<p class="note">Card Kingdom's prices, converted from US dollars at US$1 = A$${PRICE_META.usdToAud}. Hover a price for the US figure.</p>`:`<p class="note">Card Kingdom doesn't list this product, so there's no price for it.</p>`}
    <div class="mdl-actions left"><button class="btn" data-autofocus onclick="closeModal()">Close</button></div></div>`,{label:x.name});
}
