/* =====================================================================
   Full-catalogue search and selling, replacing the Database page as a
   standalone section. Loaded after app.js, catalog.js, sealed.js and db.js.
   Overrides a handful of app.js's `function`-declared pieces (plain function
   declarations can be redeclared; the const-bound isVintagePrint call inside
   app.js's isHolo is why that one line was edited directly instead) and
   mutates a few shared arrays/objects (NAV, PAGES, TYPES, F2) in place.
   ===================================================================== */

// the Database page is no longer a section of its own; Search and the
// listing flow use its catalogue (CAT, SEAL) as their data source instead
(function(){
  const i = PAGES.indexOf("db"); if(i>=0) PAGES.splice(i,1);
  const j = NAV.findIndex(x=>x[0]==="db"); if(j>=0) NAV.splice(j,1);
})();
TYPES.push("Metal","Darkness");
Object.assign(F2, {kind:"all", set:"all", sort:"name"});
SORTS.length=0; SORTS.push(["name","Name A–Z"],["high","Price, high to low"],["low","Price, low to high"],["newset","Newest set first"]);

/* ---------- print eligibility, shared by variantsFor and (via app.js) isHolo ---------- */
function isVintagePrint(c){
  if(c.cid){ const cc=CAT.byId.get(c.cid); return !!(cc && dbPrintsFor(cc).length>1); }
  return !!c.dex;
}
function variantsFor(k){
  const c=CARDS[k];
  if(isVintagePrint(c)){
    const holo=c.rar==="Holo rare";
    if(c.cid){
      const cc=CAT.byId.get(c.cid);
      if(cc && !dbPrintsFor(cc).includes("shadow")) return [
        {id:"unl",label:"Unlimited",short:"Unlimited",mult:1,note:"the common 1999–2000 print"},
        {id:"first",label:"1st Edition",short:"1st Ed",mult:holo?4.6:3.1,note:"stamped, scarce"}];
    }
    return [{id:"unl",label:"Unlimited",short:"Unlimited",mult:1,note:"the common 1999–2000 print"},
            {id:"shadow",label:"Shadowless",short:"Shadowless",mult:holo?2.4:1.8,note:"no drop shadow, early run"},
            {id:"first",label:"1st Edition",short:"1st Ed",mult:holo?4.6:3.1,note:"stamped, scarce"}];
  }
  return [{id:"raw",label:"Raw, near mint",short:"Raw NM",mult:1,note:"ungraded"},
          {id:"psa9",label:"PSA 9",short:"PSA 9",mult:1.9,note:"mint"},
          {id:"psa10",label:"PSA 10",short:"PSA 10",mult:4.2,note:"gem mint"}];
}

/* ---------- materializing a catalogue card into a real, persistent CARDS entry ---------- */
// one catalogue card = one CARDS entry (print/grade is still picked via me.vars[k], same as the
// original 168). "c_"+catalogueId is deterministic, so re-picking the same card never duplicates it.
const CUSTOM_KEY = "binderloop.customcards.v1";
let CUSTOM_CARDS = {};
(function loadCustomCards(){
  try{
    const s = JSON.parse(localStorage.getItem(CUSTOM_KEY)||"null");
    if(s && typeof s==="object") Object.keys(s).forEach(k=>{ if(k.indexOf("c_")===0 && s[k] && s[k].cid) CUSTOM_CARDS[k]=s[k]; });
  }catch(e){}
  Object.assign(CARDS, CUSTOM_CARDS);
})();
function saveCustomCards(){ try{ localStorage.setItem(CUSTOM_KEY, JSON.stringify(CUSTOM_CARDS)); }catch(e){} }
function hashHue(s){ let h=11; for(const ch of String(s)) h=(h*31+ch.charCodeAt(0))|0; return Math.abs(h)%360; }
// the CARDS key for a catalogue card if one already exists (one of the original 168, or listed earlier) — else null
function keyForCatalogCard(id){ return CAT.legacy && CAT.rev[id] ? CAT.rev[id] : (CARDS["c_"+id] ? "c_"+id : null); }
function resolveOrCreateCard(catalogId, marketValue){
  const existing = keyForCatalogCard(catalogId); if(existing) return existing;
  const cc = CAT.byId.get(catalogId); if(!cc) return null;
  const key = "c_"+catalogId, holoish = /holo/i.test(cc.rarity||"");
  CARDS[key] = {n:cc.name, s:cc.set.name+(cc.rarity?", "+cc.rarity:""), v:Math.max(1,Math.round(marketValue)||1),
    h:CAT.typeHue[cc.type]||hashHue(cc.name), dex:cc.dex||0, type:cc.type||"", rar:holoish?"Holo rare":"", set:cc.set.name, cid:catalogId};
  me.vars[key] = variantsFor(key)[0].id;
  CUSTOM_CARDS[key] = CARDS[key]; saveCustomCards();
  return key;
}

/* ---------- sealed-product selling ----------
   Kept deliberately simple: quantity and a price, no print/grade, no buyer
   matching or trade offers (those only apply to card-for-card swaps here). */
const SEAL_KEY = "binderloop.sealedsell.v1";
let SEALSELL = {items:{}, sold:[]};
(function loadSealSell(){
  try{
    const s = JSON.parse(localStorage.getItem(SEAL_KEY)||"null");
    if(s && typeof s==="object"){
      if(s.items && typeof s.items==="object") Object.keys(s.items).forEach(t=>{ if(SEAL.byTid.has(Number(t))) SEALSELL.items[t]=s.items[t]; });
      if(Array.isArray(s.sold)) SEALSELL.sold=s.sold;
    }
  }catch(e){}
})();
function saveSealSell(){ try{ localStorage.setItem(SEAL_KEY, JSON.stringify(SEALSELL)); }catch(e){} }
const mySealedTids = ()=>Object.keys(SEALSELL.items).map(Number).filter(t=>SEAL.byTid.has(t));
let SLD={tid:null,qty:1,price:null};
function openListSealed(tid){
  const x=SEAL.byTid.get(tid); if(!x) return;
  const cur=SEALSELL.items[tid];
  SLD={tid, qty:cur?cur.qty:1, price:cur?cur.ask:(x.aud!==""?x.aud:1)};
  renderListSealedModal();
}
function sldSet(patch){ Object.assign(SLD,patch); renderListSealedModal(); }
function renderListSealedModal(){
  const x=SEAL.byTid.get(SLD.tid); if(!x) return;
  const editing=!!SEALSELL.items[SLD.tid];
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <h2>${editing?"Edit your listing":"List "+esc(x.name)}</h2><p class="muted">${esc(x.set||"No set")}${x.set?" · ":""}${esc(x.kind)}</p>
    <h3 class="sub">How many</h3><div class="priceset"><input id="sldq" type="number" min="1" step="1" inputmode="numeric" aria-label="Quantity" value="${SLD.qty}" onchange="sldSet({qty:Math.max(1,Math.round(+this.value||1))})"></div>
    <h3 class="sub">Asking price each</h3>
    <div class="priceset"><span class="cur">$</span><input id="sldp" type="number" min="1" step="1" inputmode="numeric" aria-label="Asking price in dollars" value="${SLD.price}" onchange="sldSet({price:Math.max(1,Math.round(+this.value||1))})"><span class="muted">${x.aud!==""?"Market price "+money(x.aud):"No market price known for this one"}</span></div>
    <div class="mdl-actions left"><button class="btn primary lg" data-autofocus onclick="confirmListSealed()">${editing?"Save, "+money(SLD.price):"List for "+money(SLD.price)}</button>
      ${editing?`<button class="btn danger" onclick="unlistSealed(${SLD.tid})">Take it off sale</button>`:`<button class="btn" onclick="closeModal()">Cancel</button>`}</div></div>`,{label:"List sealed product"});
}
function confirmListSealed(){
  const was=!!SEALSELL.items[SLD.tid], name=SEAL.byTid.get(SLD.tid).name;
  SEALSELL.items[SLD.tid]={qty:SLD.qty,ask:SLD.price}; saveSealSell(); closeModal(); render();
  toast((was?"Updated. ":"Listed. ")+name+" for "+money(SLD.price)+(SLD.qty>1?" each":"")+".");
}
function unlistSealed(tid){ const name=SEAL.byTid.get(tid).name; delete SEALSELL.items[tid]; saveSealSell(); closeModal(); render(); toast(name+" is off sale."); }
function markSealedSold(tid){
  const it=SEALSELL.items[tid], x=SEAL.byTid.get(tid); if(!it||!x) return;
  SEALSELL.sold.unshift({tid,name:x.name,price:it.ask,qty:it.qty,t:Date.now()});
  delete SEALSELL.items[tid]; saveSealSell(); render(); toast("Marked "+x.name+" as sold for "+money(it.ask)+".");
}

/* ---------- catalogue-only detail views (for cards and sealed product with no rich marketplace data) ---------- */
function openCatalogCardModal(id){
  const key=keyForCatalogCard(id); if(key){ openCard(key); return; }
  const c=CAT.byId.get(id); if(!c) return;
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <h2>${esc(c.name)}</h2><p class="muted">${c.num?"#"+esc(c.num)+", ":""}${esc(c.set.name)}${c.rarity?", "+esc(c.rarity):""}</p>
    <p class="note">Nobody's listed this one yet, and it isn't in our price data. List it and you'll be the first, and you'll set what it's worth.</p>
    <div class="mdl-actions left"><button class="btn primary" data-autofocus onclick="pickCardToSell('${id}')">List this to sell</button><button class="btn" onclick="closeModal()">Close</button></div></div>`,{label:c.name});
}
function openSealedModal(tid){
  const x=SEAL.byTid.get(tid); if(!x) return;
  const mine=SEALSELL.items[tid];
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <h2>${esc(x.name)}</h2><p class="muted">${esc(x.set||"No set")}${x.set?" · ":""}${esc(x.kind)}</p>
    <p>${x.aud!==""?`Market price is around ${money(x.aud)}.`:"No market price is known for this one."}${mine?` You're already selling this for ${money(mine.ask)}${mine.qty>1?" each":""}.`:""}</p>
    <div class="mdl-actions left"><button class="btn primary" data-autofocus onclick="openListSealed(${tid})">${mine?"Edit your listing":"List this to sell"}</button><button class="btn" onclick="closeModal()">Close</button></div></div>`,{label:x.name});
}

/* ---------- the search box used inside the "list an item" picker ---------- */
function pickCardToSell(catalogId){
  const existing=keyForCatalogCard(catalogId);
  if(existing){ closeModal(); openListCard(existing); return; }
  const cc=CAT.byId.get(catalogId); if(!cc) return;
  PENDVAL={id:catalogId, v:""};
  renderValuePrompt();
}
let PENDVAL=null;
function pvSet(v){ PENDVAL.v=v; }
function renderValuePrompt(){
  const cc=CAT.byId.get(PENDVAL.id); if(!cc) return;
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <h2>${esc(cc.name)}</h2><p class="muted">${cc.num?"#"+esc(cc.num)+", ":""}${esc(cc.set.name)}${cc.rarity?", "+esc(cc.rarity):""}</p>
    <p>This one isn't in our price data yet, so set its market value first — you'll be able to price your own listing above or below it, same as any card.</p>
    <h3 class="sub">Market value, AUD</h3><div class="priceset"><span class="cur">$</span><input id="pvv" data-autofocus type="number" min="1" step="1" inputmode="numeric" aria-label="Market value in dollars" placeholder="e.g. 25" value="${esc(PENDVAL.v)}" onchange="pvSet(this.value)"></div>
    <p class="dberr" id="pverr" role="alert"></p>
    <div class="mdl-actions left"><button class="btn primary" onclick="pvContinue()">Continue</button><button class="btn" onclick="LD.k=null;openListCard(null)">Back</button></div></div>`,{label:cc.name});
}
function pvContinue(){
  const v=Math.round(+PENDVAL.v);
  if(!(v>0)){ const e=document.getElementById("pverr"); if(e) e.textContent="Enter a value greater than zero."; return; }
  const id=PENDVAL.id; PENDVAL=null;
  const key=resolveOrCreateCard(id, v);
  if(key) openListCard(key);
}
function psRank(name, words){ const n=name.toLowerCase(), phrase=words.join(" "); return n===phrase?0:n.startsWith(phrase)?1:n.startsWith(words[0])?2:3; }
function psQuery(q){
  const box=document.getElementById("ps-res"); if(!box) return;
  const words=q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if(!words.length){ box.innerHTML=""; return; }
  const cardHits=[], sealHits=[];
  for(const c of CAT.cards){ if(words.every(w=>c.hay.includes(w))){ cardHits.push(c); if(cardHits.length>=300) break; } }
  for(const x of SEAL.items){ if(words.every(w=>x.hay.includes(w))){ sealHits.push(x); if(sealHits.length>=300) break; } }
  cardHits.sort((a,b)=>psRank(a.name,words)-psRank(b.name,words)||a.name.length-b.name.length);
  sealHits.sort((a,b)=>psRank(a.name,words)-psRank(b.name,words)||a.name.length-b.name.length);
  const rows=[];
  cardHits.slice(0,6).forEach(c=>{
    const key=keyForCatalogCard(c.id), priced=key?money(valOf(key,me.vars[key]||variantsFor(key)[0].id)):"No price yet";
    rows.push(`<button class="dbhit" onclick="pickCardToSell('${c.id}')"><b>${esc(c.name)}</b><span>${esc(c.set.name)} · #${esc(c.num)} · ${priced}</span></button>`);
  });
  sealHits.slice(0,6).forEach(x=>{
    rows.push(`<button class="dbhit" onclick="openListSealed(${x.tid})"><b>${esc(x.name)}</b><span>${esc(x.set||"No set")} · ${esc(x.kind)} · ${x.aud!==""?money(x.aud):"No price yet"}</span></button>`);
  });
  box.innerHTML = rows.length ? rows.join("") : `<p class="muted dbhint">Nothing matches. Try fewer words.</p>`;
}

/* ---------- Search tab: spans every card and every sealed product ---------- */
function searchResults(){
  const words=F2.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtersActive = F2.sort!=="name" || F2.type!=="All" || F2.set!=="all" || F2.min!==""||F2.max!==""||F2.stock||F2.kind!=="all";
  const out=[];
  if(!words.length && !filtersActive){
    Object.keys(CARDS).filter(k=>!CARDS[k].cid && CARDS[k].v>=60).forEach(k=>out.push({kind:"card",k}));
  }else{
    if(F2.kind!=="sealed") for(const c of CAT.cards){
      if(F2.type!=="All" && c.type!==F2.type) continue;
      if(F2.set!=="all" && c.set.id!==F2.set) continue;
      if(words.length && !words.every(w=>c.hay.includes(w))) continue;
      const key=keyForCatalogCard(c.id);
      if(key) out.push({kind:"card",k:key}); else out.push({kind:"catcard",c});
    }
    if(F2.kind!=="cards" && F2.type==="All") for(const x of SEAL.items){
      if(F2.set!=="all" && x.setId!==F2.set) continue;
      if(words.length && !words.every(w=>x.hay.includes(w))) continue;
      out.push({kind:"sealed",x});
    }
  }
  out.forEach(h=>{
    if(h.kind==="card"){ const c=CARDS[h.k]; h.price=valOf(h.k,me.vars[h.k]||variantsFor(h.k)[0].id); h.name=c.n; h.sk=(c.set||"")+"|"+c.n; }
    else if(h.kind==="catcard"){ h.price=null; h.name=h.c.name; h.sk=h.c.set.date+"|"+h.c.name; }
    else { h.price=h.x.aud===""?null:h.x.aud; h.name=h.x.name; h.sk=(h.x.released||"9999")+"|"+h.x.name; }
  });
  let hits=out;
  if(F2.stock) hits=hits.filter(h=>h.kind==="card" && holdersOf(h.k)+stockedAt(h.k)>0);
  if(F2.min!==""||F2.max!==""){
    const mn=+F2.min||0, mx=F2.max===""?Infinity:+F2.max;
    hits=hits.filter(h=>h.price!=null && h.price>=mn && h.price<=mx);
  }
  const cmp=(x,y)=>x<y?-1:x>y?1:0, byName=(a,b)=>cmp(a.name,b.name);
  const sorters={name:byName, high:(a,b)=>((b.price||0)-(a.price||0))||byName(a,b),
    low:(a,b)=>((a.price==null?Infinity:a.price)-(b.price==null?Infinity:b.price))||byName(a,b),
    newset:(a,b)=>cmp(b.sk,a.sk)||byName(a,b)};
  return hits.sort(sorters[F2.sort]||byName);
}
function searchCatTile(c){
  return `<button class="tile" onclick="openCatalogCardModal('${c.id}')"><span class="tile-art"><div class="cf" style="--h:${CAT.typeHue[c.type]||hashHue(c.name)}"><span class="cf-top">${esc(c.name)}</span><span class="cf-art"><i>${esc((c.name[0]||"?").toUpperCase())}</i></span><span class="cf-foot">${esc(c.set.name)}</span></div></span>
    <span class="tile-b"><b>${esc(c.name)}</b><span class="tile-s">${c.num?"#"+esc(c.num)+", ":""}${esc(c.set.name)}</span>
    <span class="tile-t"><span class="tag">No price yet</span></span></span></button>`;
}
function searchSealedTile(x){
  return `<button class="tile" onclick="openSealedModal(${x.tid})"><span class="tile-art"><div class="cf" style="--h:${hashHue(x.name)}"><span class="cf-top">${esc(x.name)}</span><span class="cf-art">${ic("tag",30)}</span><span class="cf-foot">${esc(x.kind)}</span></div></span>
    <span class="tile-b"><b>${esc(x.name)}</b><span class="tile-s">${esc(x.set||"No set")}</span>
    <span class="tile-t">${x.aud!==""?`<span class="tag">${money(x.aud)}</span>`:`<span class="tag">No price yet</span>`}${SEALSELL.items[x.tid]?`<span class="tag hit">You're selling this</span>`:""}</span></span></button>`;
}
function searchCatRow(c){
  return `<tr onclick="openCatalogCardModal('${c.id}')"><td><span class="tcell"><span class="fw sm"><div class="cf sm" style="--h:${CAT.typeHue[c.type]||hashHue(c.name)}"><span class="cf-art"><i>${esc((c.name[0]||"?").toUpperCase())}</i></span></div></span><span><b>${esc(c.name)}</b><em>${c.num?"#"+esc(c.num):""}</em></span></span></td><td>${esc(c.set.name)}</td><td></td><td class="num">No price</td><td class="num">–</td><td class="num">–</td><td></td></tr>`;
}
function searchSealedRow(x){
  return `<tr onclick="openSealedModal(${x.tid})"><td><span class="tcell"><span class="fw sm"><div class="cf sm" style="--h:${hashHue(x.name)}"><span class="cf-art">${ic("tag",16)}</span></div></span><span><b>${esc(x.name)}</b><em>${esc(x.kind)}</em></span></span></td><td>${esc(x.set||"No set")}</td><td></td><td class="num">${x.aud!==""?money(x.aud):"No price"}</td><td class="num">–</td><td class="num">–</td><td></td></tr>`;
}
function searchPage(){
  if(CAT.state!=="ready"){
    if(CAT.state==="error") return pageHead("Search","Every card and sealed product, with prices where we have them.") +
      emptyBox("Couldn't load the catalogue","The file data/catalog.js wasn't found. Keep the data folder next to index.html, and serve the site over http if your browser blocks local files.",`<button class="btn primary" onclick="dbRetryCatalog()">Try again</button>`);
    catLoad(()=>render());
    return pageHead("Search","Every card and sealed product, with prices where we have them.") +
      `<div class="empty" role="status"><b>Loading the catalogue…</b><p>About 20,000 cards. This only happens the first time.</p></div>`;
  }
  const hits=searchResults(), shown=hits.slice(0,F2.limit), act=searchActiveFilters();
  const tile=h=>h.kind==="card"?(()=>{ const k=h.k, c=CARDS[k], [own,sale,trade]=community(k); return `<button class="tile" onclick="openCard('${k}')"><span class="tile-art tilt">${cardFace(k)}<span class="sticker">${money(c.v)}</span></span>
      <span class="tile-b"><b>${esc(c.n)}</b><span class="tile-s">${c.dex?"#"+String(c.dex).padStart(3,"0")+", ":""}${esc(c.s)}</span>
      <span class="tile-t">${holoChip(k)}<span class="tag">${sale} selling</span><span class="tag">${trade} trading</span>${me.wants.includes(k)?`<span class="tag want">On your want list</span>`:""}</span></span></button>`; })()
    : h.kind==="catcard" ? searchCatTile(h.c) : searchSealedTile(h.x);
  const row=h=>h.kind==="card"?(()=>{ const k=h.k, c=CARDS[k], [own,sale,trade]=community(k); return `<tr onclick="openCard('${k}')"><td><span class="tcell"><span class="fw sm">${cardFace(k,{sm:true})}</span><span><b>${esc(c.n)}</b><em>${c.dex?"#"+String(c.dex).padStart(3,"0"):""}</em></span></span></td><td>${esc(c.s)}</td><td>${holoChip(k)}</td><td class="num">${money(c.v)}</td><td class="num">${sale}</td><td class="num">${trade}</td><td>${me.wants.includes(k)?`<span class="tag want">Wanted</span>`:`<button class="btn sm" onclick="event.stopPropagation();toggleWant('${k}')">Add to want list</button>`}</td></tr>`; })()
    : h.kind==="catcard" ? searchCatRow(h.c) : searchSealedRow(h.x);
  return pageHead("Search","Every card and sealed product, with prices where we have them.")
  + `<div class="bigsearch">${ic("search",20)}<input id="sq" placeholder="Charizard, Evolving Skies box, 143" autocomplete="off" value="${esc(F2.q)}" aria-label="Search cards and sealed product" oninput="F2.q=this.value;F2.limit=24;render()"></div>
    <div class="rbar"><h2>${plural(hits.length,"result")}</h2>
      <div class="rbar-r">
        <div class="fwrap"><button class="btn fbtn${act.length?" has":""}" aria-expanded="${!!F2.open}" aria-haspopup="dialog" onclick="toggleFilters()">${ic("filter",16)}Filters${act.length?`<i class="fcount">${act.length}</i>`:""}</button>${F2.open?filterPop(hits.length):""}</div>
        <label class="sel">Sort<select onchange="F2.sort=this.value;F2.limit=24;render()" aria-label="Sort results">${SORTS.map(([v,l])=>`<option value="${v}"${F2.sort===v?" selected":""}>${l}</option>`).join("")}</select></label>
        <div class="viewt" role="group" aria-label="View"><button class="${F2.view==="grid"?"on":""}" aria-pressed="${F2.view==="grid"}" onclick="F2.view='grid';render()" aria-label="Grid view">${ic("grid",17)}</button><button class="${F2.view==="table"?"on":""}" aria-pressed="${F2.view==="table"}" onclick="F2.view='table';render()" aria-label="Table view">${ic("list",17)}</button></div></div></div>
    ${act.length?`<div class="actf">${act.map(([id,l])=>`<button class="chip on" onclick="clearFilter('${id}')" aria-label="Remove filter: ${esc(l)}">${esc(l)}${ic("x",13)}</button>`).join("")}<button class="link" onclick="setF2({type:'All',stock:false,min:'',max:''})">Clear all</button></div>`:""}
    ${!hits.length?emptyBox("Nothing matches","Try different words, or remove a filter."):F2.view==="grid"?`<div class="tiles">${shown.map(tile).join("")}</div>`
      :`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Item</th><th>Set</th><th></th><th class="num">Price</th><th class="num">Selling</th><th class="num">Trading</th><th></th></tr></thead><tbody>${shown.map(row).join("")}</tbody></table></div>`}
    ${hits.length>F2.limit?`<div class="more-w"><span class="muted">Showing ${F2.limit} of ${hits.length}</span><button class="btn" onclick="F2.limit+=24;render()">Show 24 more</button></div>`:""}`;
}
function searchActiveFilters(){
  return [F2.type!=="All"&&["type",F2.type], F2.set!=="all"&&CAT.setById[F2.set]&&["set",CAT.setById[F2.set].name],
    F2.kind!=="all"&&["kind",F2.kind==="cards"?"Cards only":"Sealed only"], F2.stock&&["stock","Available to trade or buy"],
    (F2.min!==""||F2.max!=="")&&["price",F2.min!==""&&F2.max!==""?`${money(+F2.min)} to ${money(+F2.max)}`:F2.min!==""?`${money(+F2.min)} and up`:`Up to ${money(+F2.max)}`]].filter(Boolean);
}
function clearFilter(id){ setF2(id==="type"?{type:"All"}:id==="set"?{set:"all"}:id==="kind"?{kind:"all"}:id==="price"?{min:"",max:""}:{[id]:false}); }
function filterPop(n){
  const sw=(on,label,fn)=>`<button class="fsw${on?" on":""}" role="switch" aria-checked="${on}" onclick="${fn}"><span>${label}</span><i></i></button>`;
  const kindSeg=[["all","All"],["cards","Cards"],["sealed","Sealed"]].map(([id,l])=>`<button class="${F2.kind===id?"on":""}" aria-pressed="${F2.kind===id}" onclick="setF2({kind:'${id}'})">${l}</button>`).join("");
  return `<div class="fpop" role="dialog" aria-label="Filters">
    <div class="fpop-h"><h3>Filters</h3><button class="icon-btn sm" onclick="toggleFilters(false)" aria-label="Close filters">${ic("x",15)}</button></div>
    <h4>Kind</h4><div class="segc">${kindSeg}</div>
    <h4>Set</h4><select class="dbsel" style="width:100%" aria-label="Set" onchange="setF2({set:this.value})">${dbSetOptions(F2.set)}</select>
    ${F2.kind!=="sealed"?`<h4>Type</h4><div class="chips-l">${TYPES.map(t=>`<button class="chip${F2.type===t?" on":""}" aria-pressed="${F2.type===t}" onclick="setF2({type:'${t}'})">${t}</button>`).join("")}</div>`:""}
    <h4>Show only</h4>${sw(F2.stock,"Someone has one to trade or sell","setF2({stock:!F2.stock})")}
    <h4>Price</h4><div class="range"><input type="number" min="0" placeholder="Min" aria-label="Minimum price" value="${esc(F2.min)}" onchange="setF2({min:this.value})"><span>to</span><input type="number" min="0" placeholder="Max" aria-label="Maximum price" value="${esc(F2.max)}" onchange="setF2({max:this.value})"></div>
    <div class="fpop-f"><button class="link" onclick="setF2({type:'All',set:'all',kind:'all',stock:false,min:'',max:''})">Clear all</button><button class="btn primary" onclick="toggleFilters(false)">Show ${plural(n,"result")}</button></div></div>`;
}

/* ---------- "Add a card" (binder, not for sale) now searches the whole catalogue too ---------- */
function openAddCard(q){
  if(CAT.state!=="ready"){
    if(CAT.state!=="error") catLoad(()=>{ const m=$("#modal"); if(m && m.classList.contains("on")) openAddCard(); });
    openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>Add a card</h2>
      ${CAT.state==="error"?emptyBox("Couldn't load the catalogue","The file data/catalog.js wasn't found.",`<button class="btn primary" onclick="dbRetryCatalog();openAddCard()">Try again</button>`)
        :`<div class="empty" role="status"><b>Loading the catalogue…</b><p>About 20,000 cards. This only happens the first time.</p></div>`}</div>`,{label:"Add a card"});
    return;
  }
  if(q!=null) addQ=q; const s=addQ.trim().toLowerCase(), words=s.split(/\s+/).filter(Boolean);
  let hits=[];
  if(words.length){
    for(const c of CAT.cards){ if(words.every(w=>c.hay.includes(w))){ hits.push(c); if(hits.length>=300) break; } }
    hits.sort((a,b)=>psRank(a.name,words)-psRank(b.name,words)||a.name.length-b.name.length);
    hits=hits.slice(0,8);
  }
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>Add a card</h2><p class="muted">Search any card, then add it to your binder or your want list.</p>
    <div class="bigsearch" style="margin:14px 0"><input id="aq" data-autofocus placeholder="Search by name, set or Pokédex number" autocomplete="off" value="${esc(addQ)}" oninput="addQ=this.value;openAddCard()" aria-label="Search cards"></div>
    ${hits.map(c=>{ const key=keyForCatalogCard(c.id), price=key?money(valOf(key,variantsFor(key)[0].id)):"No price yet";
      return `<div class="prow static"><span class="fw sm">${key?cardFace(key,{sm:true}):`<div class="cf sm" style="--h:${CAT.typeHue[c.type]||hashHue(c.name)}"><span class="cf-art"><i>${esc((c.name[0]||"?").toUpperCase())}</i></span></div>`}</span><span><b>${esc(c.name)}</b><em>${esc(c.set.name)}</em></span><span class="val">${price}</span>
      <button class="btn sm" onclick="addCatalogCard('${c.id}')">Add to binder</button><button class="btn sm" onclick="wantCatalogCard('${c.id}')">Add to want list</button></div>`; }).join("")||(words.length?`<p class="muted">Nothing matches that.</p>`:"")}</div>`,{label:"Add a card"});
  const n=$("#aq"); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); }
}
function addCatalogCard(id){
  const key=keyForCatalogCard(id);
  if(key){ if(me.cards[key]){ toast(CARDS[key].n+" is already in your binder."); openAddCard(); return; } ownCard(key); openAddCard(); return; }
  const cc=CAT.byId.get(id); if(!cc) return;
  const k=resolveOrCreateCard(id, 1); ownCard(k); openAddCard();
}
function wantCatalogCard(id){
  const key=keyForCatalogCard(id) || resolveOrCreateCard(id, 1);
  if(key){ toggleWant(key); openAddCard(); }
}

/* ---------- sealed listings block, inserted into sellPage() ---------- */
function sealedSellSection(){
  const tids=mySealedTids().sort((a,b)=>(SEALSELL.items[b].ask*SEALSELL.items[b].qty)-(SEALSELL.items[a].ask*SEALSELL.items[a].qty));
  const soldTotal=SEALSELL.sold.reduce((t,x)=>t+x.price*x.qty,0);
  if(!tids.length && !SEALSELL.sold.length) return "";
  return `<div class="rbar" style="margin-top:26px"><h2>Sealed product for sale</h2></div>
    ${tids.length?`<div class="tbl-wrap"><table class="tbl sellt"><thead><tr><th>Product</th><th class="num">Qty</th><th class="num">Asking each</th><th class="num">Total</th><th></th></tr></thead><tbody>
      ${tids.map(tid=>{ const x=SEAL.byTid.get(tid), it=SEALSELL.items[tid];
        return `<tr><td><button class="tcell" onclick="openSealedModal(${tid})"><span class="fw sm"><div class="cf sm" style="--h:${hashHue(x.name)}"><span class="cf-art">${ic("tag",16)}</span></div></span><span><b>${esc(x.name)}</b><em>${esc(x.kind)}</em></span></button></td>
        <td class="num">${it.qty}</td><td class="num"><span class="sticker sm">${money(it.ask)}</span></td><td class="num">${money(it.ask*it.qty)}</td>
        <td class="acts"><button class="btn sm" onclick="openListSealed(${tid})">Edit</button><button class="btn sm" onclick="markSealedSold(${tid})">Mark as sold</button></td></tr>`; }).join("")}</tbody></table></div>`
      :emptyBox("No sealed product listed yet","Search for a booster box, ETB or other sealed product above to list it.")}
    ${SEALSELL.sold.length?`<p class="muted" style="margin-top:10px">${plural(SEALSELL.sold.length,"sealed item")} sold, ${money(soldTotal)} in total.</p>`:""}`;
}
