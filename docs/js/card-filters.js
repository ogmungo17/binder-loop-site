/* =====================================================================
   Card filters shared by every card search (Search, the Buy feed, List an
   item, Add a card, trade-night wants): Set, Holographic, Sealed, Graded and
   Alternate art. Loaded after market-search.js.
   The catalogue has no holo or alt-art flag, so both are read from the
   rarity ("Rare Holo", "Illustration Rare"...) and, for the marketplace's
   own cards, from their "Alt art" note.
   ===================================================================== */
const CF_KEYS = ["holo","sealed","graded","alt"];
const CF_LABEL = {holo:"Holographic", sealed:"Sealed", graded:"Graded", alt:"Alternate art"};
const CF = {}, CF_RUN = {}, CF_OPT = {};
const cfState = ctx => CF[ctx] || (CF[ctx] = {set:"all", holo:false, sealed:false, graded:false, alt:false});
const cfActive = f => f.set!=="all" || CF_KEYS.some(x=>f[x]);
function cfReset(ctx){ Object.assign(cfState(ctx), {set:"all", holo:false, sealed:false, graded:false, alt:false}); }

/* ---------- what a card is ---------- */
// the catalogue record behind a marketplace card key (once the catalogue has loaded)
function cfCat(k){ const c=CARDS[k]; if(!c || CAT.state!=="ready") return null; return CAT.byId.get(c.cid || CAT.legacy[k]) || null; }
const cfRarHolo = r => !!r && !/^(Common|Uncommon|Rare|Promo)$/.test(r);
const cfRarAlt = r => /Illustration Rare|Trainer Gallery/.test(r||"");
function cfHoloKey(k){ const cc=cfCat(k); return cc ? cfRarHolo(cc.rarity) : isHolo(k); }
function cfAltKey(k){ const cc=cfCat(k); return /alt art/i.test(CARDS[k].s||"") || !!(cc && cfRarAlt(cc.rarity)); }
function cfSetKey(k){ const cc=cfCat(k); return cc ? cc.set.id : ""; }
function cfHoloCat(c){ const k=keyForCatalogCard(c.id); return k ? cfHoloKey(k) : cfRarHolo(c.rarity); }
function cfAltCat(c){ const k=keyForCatalogCard(c.id); return k ? cfAltKey(k) : cfRarAlt(c.rarity); }
// "graded" depends on the search: a PSA copy someone nearby has, or a card that comes in PSA grades at all
const cfGradedHeld = k => PARTIES().some(p=>p.cards[k] && /^psa/.test((p.vars||{})[k]||""));
const cfGradeableKey = k => !isVintagePrint(CARDS[k]);
const cfGradeableCat = c => dbPrintsFor(c).length<=1;

// one searchable thing, described for cfPass
const cfKeyItem = (k,graded) => ({set:cfSetKey(k), holo:()=>cfHoloKey(k), alt:()=>cfAltKey(k), graded:()=>graded(k)});
const cfCatItem = (c,graded) => ({set:c.set.id, holo:()=>cfHoloCat(c), alt:()=>cfAltCat(c), graded:()=>graded(c)});
const cfSealItem = x => ({sealed:true, set:x.setId});
function cfPass(f,o){
  if(f.set!=="all" && o.set!==f.set) return false;
  if(o.sealed) return !(f.holo||f.graded||f.alt);   // sealed product is never holo, graded or alt art
  if(f.sealed) return false;
  return (!f.holo||o.holo()) && (!f.alt||o.alt()) && (!f.graded||o.graded());
}

/* ---------- the filter bar ---------- */
// run: re-runs the search. o.sets: set ids to offer (default: every set). o.noSealed: why Sealed is off here. o.gradedTip: what Graded means here
function cfBar(ctx,run,o={}){
  CF_RUN[ctx]=run; CF_OPT[ctx]=o;
  if(CAT.state==="idle" || CAT.state==="loading") catLoad(()=>{ cfRefresh(ctx); if(CF_RUN[ctx]) CF_RUN[ctx](); });
  return `<div class="cfbar" id="cf-${ctx}" role="group" aria-label="Filters">${cfBarInner(ctx)}</div>`;
}
function cfBarInner(ctx){
  const f=cfState(ctx), o=CF_OPT[ctx]||{};
  const sel = CAT.state==="ready"
    ? `<select class="dbsel cf-set${f.set!=="all"?" on":""}" aria-label="Set" onchange="cfSet('${ctx}',this.value)">${cfSetOptions(f.set,o.sets)}</select>`
    : `<select class="dbsel cf-set" aria-label="Set" disabled><option>${CAT.state==="error"?"Sets unavailable":"Loading sets…"}</option></select>`;
  const chip = x => { const off = x==="sealed" && o.noSealed, tip = off ? o.noSealed : x==="graded" ? o.gradedTip : "";
    return `<button class="chip${f[x]?" on":""}" aria-pressed="${!!f[x]}"${off?" disabled":""}${tip?` title="${esc(tip)}"`:""} onclick="cfToggle('${ctx}','${x}')">${CF_LABEL[x]}</button>`; };
  return sel + CF_KEYS.map(chip).join("") + (cfActive(f)?`<button class="link" onclick="cfClear('${ctx}')">Clear</button>`:"");
}
function cfSetOptions(cur,ids){
  if(!ids) return dbSetOptions(cur);
  const list=[...new Set(ids.concat(cur!=="all"?[cur]:[]))].map(id=>CAT.setById[id]).filter(Boolean).sort((a,b)=>b.date<a.date?-1:b.date>a.date?1:0);
  return `<option value="all">All sets</option>` + list.map(s=>`<option value="${esc(s.id)}"${cur===s.id?" selected":""}>${esc(s.name)} (${s.year})</option>`).join("");
}
function cfRefresh(ctx){ const el=document.getElementById("cf-"+ctx); if(el) el.innerHTML=cfBarInner(ctx); }
function cfRerun(ctx){ cfRefresh(ctx); if(CF_RUN[ctx]) CF_RUN[ctx](); }
function cfToggle(ctx,x){ const f=cfState(ctx); f[x]=!f[x]; cfRerun(ctx); }
function cfSet(ctx,v){ cfState(ctx).set=v; cfRerun(ctx); }
function cfClear(ctx){ cfReset(ctx); cfRerun(ctx); }
