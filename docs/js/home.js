/* =====================================================================
   The front page (#/) as a storefront: a nav with a tab and menu for each game, a banner carousel, and scrolling rows
   of collectors and stores, steals and deals, and the cards people are hunting. The rows follow the game switch (Pokémon
   or Magic), so nothing from a game's catalogue loads until it's chosen. landing() in app.js calls lpStorefront() for
   this part and keeps its own sections below it. Loaded after mtg.js.
   ===================================================================== */
const LPC = {i:0, t:null, hold:false, menu:null, hov:null};
const LP_SLIDES = 4;
// what each game's menu offers: [label, a search preset]; Shop all goes to the Buy feed
const LP_SHOP = {
  pokemon:[["Singles",{}],["Sealed product",{sealed:true}],["Holographic cards",{holo:true}],["Alternate arts",{alt:true}],["Graded slabs",{graded:true}]],
  mtg:[["Singles",{}],["Sealed product",{sealed:true}],["Foil cards",{holo:true}],["Alternate art",{alt:true}],["On the Card Kingdom buylist",{buy:true}]]
};
const lpName = g=>g==="mtg"?"Magic: The Gathering":"Pokémon";

/* ---------- game tabs and menus ---------- */
function lpShop(g,preset){
  lpClose(); setGame(g,true);
  if(!preset){ go("market","listings"); return; }
  cfReset("search"); mxReset(); Object.assign(F2,{q:"",min:"",max:"",stock:false,limit:24});
  const f=cfState("search"); ["holo","sealed","graded","alt"].forEach(x=>{ if(preset[x]) f[x]=true; });
  if(preset.set) f.set=preset.set; if(preset.buy) MX.buy=true;
  go("search");
}
function lpClose(){
  LPC.menu=null;
  document.querySelectorAll(".lp-g").forEach(el=>{ el.classList.remove("open"); const b=el.querySelector(".lp-gb"); if(b) b.setAttribute("aria-expanded","false"); });
}
function lpMenu(g,force){
  const open = force===undefined ? LPC.menu!==g : force;
  lpClose();
  if(!open) return;
  const el=document.querySelector(`.lp-g[data-g="${g}"]`); if(!el) return;
  LPC.menu=g; el.classList.add("open"); el.querySelector(".lp-gb").setAttribute("aria-expanded","true");
  const panel=el.querySelector(".lp-mega"), room=el.closest(".lp-nav-in").clientWidth-panel.offsetWidth;
  panel.style.left=Math.max(0,Math.min(el.offsetLeft,room))+"px";
  lpFillSets(g);
}
// opening on hover is for mice only; touch and keyboard use the click
function lpHover(g,on,e){
  if(e.pointerType!=="mouse") return;
  clearTimeout(LPC.hov);
  if(on) LPC.hov=setTimeout(()=>lpMenu(g,true),90); else LPC.hov=setTimeout(()=>{ if(LPC.menu===g && !document.querySelector(`.lp-g[data-g="${g}"]:focus-within`)) lpClose(); },220);
}
// the newest sets, once that game's catalogue is in (Pokémon's loads the first time its menu opens)
function lpFillSets(g){
  const fill=()=>{
    const ul=document.querySelector(`.lp-sets[data-g="${g}"]`); if(!ul) return;
    const sets=g==="mtg" ? (MTG.state==="ready"?MTG.sets.filter(s=>s.n).map(s=>({id:s.code,name:s.name,year:s.year,date:s.date})):[]) : (CAT.state==="ready"?CAT.sets.map(s=>({id:s.id,name:s.name,year:s.year,date:s.date})):[]);
    const today=new Date().toISOString().slice(0,10);   // sets announced but not out yet aren't "newest"
    const top=sets.filter(s=>s.date<=today).sort((a,b)=>b.date<a.date?-1:b.date>a.date?1:0).slice(0,6);
    ul.innerHTML=top.map(s=>`<li><button onclick="lpShop('${g}',{set:'${esc(s.id)}'})">${esc(s.name)}<em>${s.year||""}</em></button></li>`).join("");
    ul.previousElementSibling.hidden=!top.length;
  };
  if(g==="pokemon" && CAT.state!=="ready"){ catLoad(fill); return; }
  fill();
}
function lpMega(g){
  const deal=listings().filter(l=>gameOf(l.k)===g&&l.diff<0).sort((a,b)=>a.diff-b.diff)[0];
  const feat=deal
    ? `<button class="lp-feat" onclick="lpClose();go('market','listings');openListing('${deal.id}')"><span class="lp-feat-art tilt">${faceOf(deal.k,deal.seller)}</span><span class="lp-feat-b"><b>${esc(CARDS[deal.k].n)}</b><span>${esc(deal.seller.name)}, ${kmTxt(deal.dist)}</span><span class="lp-feat-p"><span class="sticker sm">${money(deal.price)}</span><em>${-deal.diff}% under market</em></span><span class="link">Shop now ${ic("chev",13)}</span></span></button>`
    : `<div class="lp-feat lp-feat-s"><span class="lp-feat-art">${[["Sol Ring",212],["Counterspell",48]].map(([n,h])=>mtgFace({n,h,set:"Every printing"})).join("")}</span><span class="lp-feat-b"><b>Every printing, every finish</b><span>Card Kingdom's price for Normal, Foil and Etched.</span></span></div>`;
  return `<div class="lp-mega" id="mega-${g}" role="region" aria-label="${lpName(g)}">
    <div class="lp-mega-h"><h3>${lpName(g)}</h3><button class="btn lp-shopall" onclick="lpShop('${g}')">Shop all ${ic("chev",14)}</button></div>
    <div class="lp-mega-b">${feat}
      <div class="lp-mega-l"><h4>Shop by</h4><ul>${LP_SHOP[g].map(([l,p])=>`<li><button onclick='lpShop("${g}",${JSON.stringify(p)})'>${l}</button></li>`).join("")}<li><button onclick="lpClose();go('market','trades')">Open to trade</button></li></ul>
        <h4 hidden>Newest sets</h4><ul class="lp-sets" data-g="${g}"></ul></div></div></div>`;
}
function lpNav(){
  return `<header class="lp-nav lp-top"><div class="lp-nav-in"><a class="brand" href="#/">${LOGO}<span>Binder Loop</span></a>
    <nav class="lp-games" aria-label="Games">${GAMES.map(([g])=>`<div class="lp-g" data-g="${g}" onpointerenter="lpHover('${g}',true,event)" onpointerleave="lpHover('${g}',false,event)">
      <button class="lp-gb${GM.game===g?" on":""}" aria-haspopup="true" aria-expanded="false" aria-controls="mega-${g}" onclick="lpMenu('${g}')"><span>${g==="mtg"?`Magic<span class="lp-long">: The Gathering</span>`:lpName(g)}</span>${ic("chev",13)}</button>${lpMega(g)}</div>`).join("")}</nav>
    <div class="lp-nav-r"><button class="btn login" onclick="openProfiles()">${av(me,"xs")}Log in</button><button class="btn primary" onclick="go('home')">Open the demo</button></div></div></header>
  <nav class="lp-sub" aria-label="Site"><div class="lp-sub-in"><button onclick="go('market','listings')">Browse</button><button onclick="lpJump('lp-deals')">Steals &amp; deals</button><button onclick="lpJump('lp-wanted')">Wanted</button><button onclick="lpJump('nights')">Trade nights</button><button onclick="lpJump('stores')">Partner stores</button><button onclick="lpJump('how')">How it works</button><button onclick="lpJump('faq')">Questions</button></div></nav>`;
}
function lpJump(id){ lpClose(); const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:"smooth"}); }

/* ---------- the banner carousel ---------- */
function lpStage(){
  const nights=STORES.map(st=>nextNights(st,1)[0]).filter(Boolean), n0=nights[0];
  const heroL=listings().filter(l=>gameOf(l.k)==="pokemon"&&!l.seller.store&&l.diff<0&&isHolo(l.k)).sort((a,b)=>b.price-a.price)[0];
  const chase=["lugia","g1_6","umb","gengar","ray"].filter(k=>CARDS[k]);
  const pt=["g1_6","umb"].filter(k=>CARDS[k]).map(k=>`<table class="ptable"><thead><tr><th colspan="2">${esc(CARDS[k].n)}, ${esc(CARDS[k].s.split(",")[0])}</th></tr></thead><tbody>${variantsFor(k).map(v=>`<tr><td>${v.label}</td><td class="num">${money(valOf(k,v.id))}</td></tr>`).join("")}</tbody></table>`).join("");
  const mfan=[["Sol Ring",212],["Lightning Bolt",6],["Counterspell",272],["Llanowar Elves",122],["Swords to Plowshares",48]];
  const slide=(n,cls,body,art)=>`<article class="lp-slide ${cls}" role="group" aria-roledescription="slide" aria-label="${n} of ${LP_SLIDES}"><div class="lp-copy">${body}</div><div class="lp-art" aria-hidden="true">${art}</div></article>`;
  const slides=[
    slide(1,"s1",`<h2>The local marketplace for trading cards.</h2><p>Buy from collectors and card stores near you, list your own in a minute, and trade instead when a swap suits you both. Every card is priced in Australian dollars.</p>
      <div class="lp-cta"><button class="btn primary lg" onclick="go('market','listings')">Browse cards for sale</button><button class="btn lg" onclick="go('market','selling');LD.k=null;openListCard(null)">Sell a card</button></div>`,
      `<div class="fan">${chase.map(k=>`<div class="fc"><div class="tilt">${cardFace(k)}</div></div>`).join("")}
        ${heroL?`<button class="float-m fl" tabindex="-1" onclick="go('market','listings');openListing('${heroL.id}')"><span class="fw">${faceOf(heroL.k,heroL.seller)}</span><span class="fl-b"><b>${esc(CARDS[heroL.k].n)}</b><span>${esc(heroL.seller.name)}, ${esc(heroL.seller.suburb)}</span><span class="fl-p"><span class="sticker">${money(heroL.price)}</span><span class="tag hit">${-heroL.diff}% under market</span></span></span></button>`:""}</div>`),
    slide(2,"s2",`<h2>Magic: The Gathering, priced from Card Kingdom.</h2><p>Every printing, singles and sealed, with its own Normal, Foil and Etched price. Sell, swap and buy with collectors near you, just like Pokémon.</p>
      <div class="lp-cta"><button class="btn primary lg" onclick="lpShop('mtg',{})">Browse Magic</button><button class="btn lg" onclick="lpShop('mtg')">See what's for sale</button></div>`,
      `<div class="fan three">${mfan.slice(0,3).map(([n,h])=>`<div class="fc"><div class="tilt">${mtgFace({n,h,set:"Every printing"})}</div></div>`).join("")}</div>`),
    slide(3,"s3",n0?`<h2>${esc(n0.st.name)} trade night, ${fmtDate(n0.date)}.</h2><p>${timeRange(n0.st.sched)}. Bring what you'll trade and see who else is going. Staff check both cards before anyone walks away.</p>
      <div class="lp-cta"><button class="btn primary lg" onclick="openNight('${n0.key}')">See the night</button><button class="btn lg" onclick="go('social','nights')">All trade nights</button></div>`
      :`<h2>A trade night every week.</h2><p>Partner stores set aside tables for handovers and swaps.</p><div class="lp-cta"><button class="btn primary lg" onclick="go('social','nights')">See trade nights</button></div>`,
      `<div class="lp-tix">${nights.slice(0,3).map(n=>`<button class="lp-tk" tabindex="-1" onclick="openNight('${n.key}')"><span class="tk-date"><b>${n.date.getDate()}</b><span>${DOWS[n.date.getDay()]}</span></span><span class="tk-b"><b>${esc(n.st.name)}</b><span class="tk-s">${timeRange(n.st.sched)}, ${esc(n.st.suburb)}</span></span><span class="tag hit">${attendees(n.key).length} going</span></button>`).join("")}</div>`),
    slide(4,"s4",`<h2>Every printing priced on its own.</h2><p>A Shadowless, a 1st Edition, a PSA 10 and a foil each have their own market value, so you pay and get paid what the exact card is worth.</p>
      <div class="lp-cta"><button class="btn primary lg" onclick="go('market','selling');LD.k=null;openListCard(null)">Sell a card</button><button class="btn lg" onclick="lpJump('how')">How it works</button></div>`,
      `<div class="lp-pt">${pt}</div>`)
  ];
  return `<section class="lp-stage" aria-roledescription="carousel" aria-label="Highlights" onpointerenter="LPC.hold=true" onpointerleave="LPC.hold=false" onfocusin="LPC.hold=true" onfocusout="LPC.hold=false">
    <div class="lp-slides" style="transform:translateX(${-100*LPC.i}%)">${slides.join("")}</div>
    <button class="lp-arrow prev" aria-label="Previous slide" onclick="lpGo((LPC.i+LP_SLIDES-1)%LP_SLIDES)">${ic("chev",18)}</button><button class="lp-arrow next" aria-label="Next slide" onclick="lpGo((LPC.i+1)%LP_SLIDES)">${ic("chev",18)}</button>
    <div class="lp-dots" role="group" aria-label="Choose a slide">${slides.map((_,i)=>`<button class="lp-dot${i===LPC.i?" on":""}" aria-label="Slide ${i+1}" aria-current="${i===LPC.i}" onclick="lpGo(${i})"></button>`).join("")}</div></section>`;
}
function lpGo(i){
  LPC.i=i;
  const tr=document.querySelector(".lp-slides"); if(!tr) return;
  tr.style.transform=`translateX(${-100*i}%)`;
  tr.querySelectorAll(".lp-slide").forEach((s,j)=>{ s.inert=j!==i; });
  document.querySelectorAll(".lp-dot").forEach((d,j)=>{ d.classList.toggle("on",j===i); d.setAttribute("aria-current",j===i); });
}
function lpStop(){ clearInterval(LPC.t); LPC.t=null; }
// runs after every render: starts the carousel timer when the front page is showing
function lpAfterRender(){
  lpStop();
  if(!document.querySelector(".lp-stage")) return;
  lpGo(LPC.i); lpArrowsAll();
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  LPC.t=setInterval(()=>{ if(!document.querySelector(".lp-stage")){ lpStop(); return; } if(!LPC.hold && !document.hidden) lpGo((LPC.i+1)%LP_SLIDES); },6500);
}
document.addEventListener("click",e=>{ if(LPC.menu && !e.target.closest(".lp-g")) lpClose(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape" && LPC.menu){ const b=document.querySelector(".lp-g.open .lp-gb"); lpClose(); if(b) b.focus(); } });
document.addEventListener("focusout",e=>{ if(LPC.menu && e.relatedTarget && !e.relatedTarget.closest(".lp-g")) lpClose(); });

/* ---------- the intro and the rows ---------- */
function lpIntro(){
  return `<section class="lp-intro"><h1>Binder Loop: the local card marketplace</h1>
    <p>Binder Loop is a marketplace for trading cards, with every sale and swap handed over at a partner store. Buy from collectors and stores near you, hunt for <button class="link" onclick="lpJump('lp-deals')">steals &amp; deals</button>, or see what people near you are <button class="link" onclick="lpJump('lp-wanted')">after</button>.</p>
    <p>Ready to sell? <button class="link" onclick="go('market','selling');LD.k=null;openListCard(null)">List a card</button> in a minute, or find a <button class="link" onclick="lpJump('stores')">partner store</button> for handovers and weekly <button class="link" onclick="lpJump('nights')">trade nights</button>.</p>
    <div class="lp-cta"><button class="btn primary" onclick="go('home')">Open the demo</button><button class="btn" onclick="go('market','listings')">Browse cards for sale</button></div>
    <p class="hero-note lp-note">A working prototype. The collectors are fictional, and prices are live market data: TCGplayer for Pokémon and Card Kingdom for Magic.</p></section>`;
}
function lpArrows(el){
  const row=el.closest(".lp-row"); if(!row) return;
  const [l,r]=row.querySelectorAll(".lp-arr"); if(!l) return;
  l.disabled=el.scrollLeft<=2; r.disabled=el.scrollLeft+el.clientWidth>=el.scrollWidth-2;
}
const lpArrowsAll = ()=>document.querySelectorAll(".lp-scroll").forEach(lpArrows);
function lpScroll(id,dir){ const el=document.getElementById(id); if(el) el.scrollBy({left:dir*el.clientWidth*.85,behavior:"smooth"}); }
function lpRow(id,icon,title,sub,link,body){
  return `<section class="lp-row" id="${id}"><div class="lp-row-h"><div><h2>${ic(icon,22)}${title}</h2><p>${sub}</p></div>
    <div class="lp-row-r">${link}<button class="lp-arr" aria-label="Scroll ${title} left" onclick="lpScroll('${id}-t',-1)">${ic("left",18)}</button><button class="lp-arr" aria-label="Scroll ${title} right" onclick="lpScroll('${id}-t',1)">${ic("chev",18)}</button></div></div>
    <div class="lp-scroll" id="${id}-t" tabindex="0" role="group" aria-label="${title}" onscroll="lpArrows(this)">${body}</div></section>`;
}
// a Magic row can't fill until the Magic data is in
function lpWait(){
  if(GM.game!=="mtg" || MTG.state==="ready") return "";
  if(MTG.state==="idle") mtgLoad(()=>render());
  return MTG.state==="error" ? `<div class="lp-empty">The Magic database isn't on this site yet.</div>` : `<div class="lp-empty" role="status">Loading Magic…</div>`;
}
function lpSellers(){
  const cover=p=>Object.keys(p.cards).filter(k=>CARDS[k]).sort((a,b)=>valOf(b,p.vars[b])-valOf(a,p.vars[a])).slice(0,3).map(k=>`<span class="lp-cv">${faceOf(k,p,{sm:true})}</span>`).join("");
  const all=[...STORES,...USERS.slice().sort((a,b)=>b.trades-a.trades||b.rating-a.rating)].slice(0,10);
  return all.map(p=>{ const want=p.store?0:overlap(p).theyHave.length;
    return `<button class="lp-sc" onclick="${p.store?`openStore('${p.id}')`:`openCollector('${p.id}')`}"><span class="lp-sc-cover" style="--h:${p.h}">${cover(p)}<span class="lp-sc-rt">★ ${p.rating} <em>(${p.trades})</em></span></span>
      <span class="lp-sc-av">${av(p,"lg")}</span><b>${esc(p.name)}<span class="lp-ver" title="Verified">${ic("check",11)}</span></b>
      <span class="lp-sc-s">${p.store?`${esc(p.suburb)}, ${p.nightFull.split(",")[0]}`:`${esc(p.suburb)}, ${kmTxt(km(me,p))}`}</span>
      <span class="tag-row">${p.store?`<span class="tag hit">Partner store</span>`:want?`<span class="tag want">${plural(want,"card")} you want</span>`:`<span class="tag">${p.followers.toLocaleString()} followers</span>`}</span></button>`; }).join("");
}
function lpDeals(){
  const g=GM.game, wait=lpWait(); if(wait) return {html:wait,n:0};
  const all=listings().filter(l=>gameOf(l.k)===g), deals=all.filter(l=>l.diff<0).sort((a,b)=>a.diff-b.diff), show=(deals.length>=4?deals:all.slice().sort((a,b)=>a.diff-b.diff)).slice(0,12);
  return {n:all.length, html:show.length?show.map(l=>`<button class="lp-dl" onclick="go('market','listings');openListing('${l.id}')"><span class="lp-dl-art tilt">${faceOf(l.k,l.seller)}${l.diff<0?`<span class="lp-off">${-l.diff}% under</span>`:""}<span class="sticker">${money(l.price)}</span></span>
      <span class="lp-dl-b"><b>${esc(CARDS[l.k].n)}</b><span>${esc(l.seller.name)}, ${kmTxt(l.dist)}</span><span class="tag-row">${gameChip(l.k)}${vchipOf(l.k,l.seller)}${me.wants.includes(l.k)?`<span class="tag want">On your want list</span>`:""}</span></span></button>`).join("")
      :`<div class="lp-empty">Nothing listed for ${lpName(g)} yet.</div>`};
}
function lpWanted(){
  const g=GM.game, wait=lpWait(); if(wait) return wait;
  const ranked=Object.keys(CARDS).filter(k=>gameOf(k)===g).map(k=>({k,n:buyersFor(k).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n||CARDS[b.k].v-CARDS[a.k].v).slice(0,12);
  return ranked.length?ranked.map(({k,n})=>`<button class="lp-dl" onclick="openCard('${k}')"><span class="lp-dl-art tilt">${cardFace(k)}<span class="lp-off want">${plural(n,"collector")} want${n===1?"s":""} it</span><span class="sticker">${money(CARDS[k].v)}</span></span>
      <span class="lp-dl-b"><b>${esc(CARDS[k].n)}</b><span>${plural(holdersOf(k)+stockedAt(k),"seller")} nearby</span><span class="tag-row">${gameChip(k)}${me.cards[k]?`<span class="tag hit">In your binder</span>`:`<span class="tag">Got one? Sell it</span>`}</span></span></button>`).join("")
    :`<div class="lp-empty">No want lists for ${lpName(g)} yet.</div>`;
}
function lpRows(){
  const d=lpDeals(), g=GM.game;
  return `<div class="lp-gamebar">${gameSwitch()}</div>
  ${lpRow("lp-sellers","shield","Trusted near you","Partner stores and the collectors with the most trades",`<button class="link" onclick="go('social','people')">All collectors ${ic("chev",14)}</button>`,lpSellers())}
  ${lpRow("lp-deals","spark",`Steals &amp; deals`,`${lpName(g)} listings, biggest % under market first`,`<button class="link" onclick="F1.sort='deal';go('market','listings')">View all ${d.n||""} ${ic("chev",14)}</button>`,d.html)}
  ${lpRow("lp-wanted","search","Most wanted near you",`${lpName(g)} cards on the most want lists. Got one? Sell it.`,`<button class="link" onclick="go('you','binder')">Your want list ${ic("chev",14)}</button>`,lpWanted())}`;
}
function lpStorefront(){ return lpNav()+lpStage()+lpIntro()+lpRows(); }
