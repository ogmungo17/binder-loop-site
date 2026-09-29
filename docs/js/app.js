/* ===== data and logic (shared with the mobile prototype) ===== */
const CARDS = {
  umb:{n:"Umbreon VMAX",s:"Evolving Skies · Alt art",v:3403.89,h:268},
  char:{n:"Charizard VMAX",s:"Shining Fates · Shiny Vault",v:194.88,h:14},
  esp:{n:"Espeon VMAX",s:"Fusion Strike · Alt art",v:492.19,h:312},
  ray:{n:"Rayquaza VMAX",s:"Evolving Skies · Alt art",v:1795.14,h:148},
  glac:{n:"Glaceon VMAX",s:"Evolving Skies · Alt art",v:446.07,h:192},
  gira:{n:"Giratina V",s:"Lost Origin · Alt art",v:1182.0,h:228},
  lugia:{n:"Lugia V",s:"Silver Tempest · Alt art",v:752.08,h:200},
  sylv:{n:"Sylveon VMAX",s:"Evolving Skies · Alt art",v:556.74,h:334},
  gengar:{n:"Gengar VMAX",s:"Fusion Strike · Alt art",v:1475.45,h:284},
  pika:{n:"Pikachu VMAX",s:"Vivid Voltage · Rainbow",v:262.26,h:48},
  mew:{n:"Mewtwo GX",s:"Shining Legends · Rainbow",v:135.05,h:318},
  leaf:{n:"Leafeon VMAX",s:"Evolving Skies · Alt art",v:589.62,h:104},
  jolt:{n:"Jolteon VMAX",s:"Evolving Skies",v:15.79,h:50},
  flare:{n:"Flareon VMAX",s:"Evolving Skies",v:18.8,h:18},
  vapo:{n:"Vaporeon VMAX",s:"Evolving Skies",v:15.76,h:196},
  tyra:{n:"Tyranitar V",s:"Battle Styles · Alt art",v:363.32,h:96},
  pidg:{n:"Pidgeot V",s:"Lost Origin · Full art",v:3.82,h:34}
};
// status: own (not available) | trade | sell | want
// Demo profiles: three logins for showing the site in store. Each keeps its own binder, listings,
// offers and trade nights in this browser; switching reloads the page as the other profile.
const PROFILES = [
  {id:"jonah", name:"Jonah B", initials:"JB", suburb:"Marrickville", rating:4.9, trades:47, h:268,
   tagline:"Modern alt arts and vintage holos", home:"holohall", follows:["dan"], since:"2020", followers:143,
   bio:"Trading most Thursdays at Holo Hall. Always after Evolving Skies alt arts, and happy to talk vintage.", badges:["Verified ID"],
   cards:{char:"trade", g1_9:"sell", gengar:"trade", leaf:"trade", g1_143:"own", pika:"own", g1_149:"trade", g1_65:"sell"},
   vars:{char:"psa9", g1_9:"unl", gengar:"raw", leaf:"raw", g1_143:"shadow", pika:"raw", g1_149:"unl", g1_65:"shadow"},
   wants:["umb","glac","gira","esp","g1_6","jolt"]},
  {id:"ella", name:"Ella M", initials:"EM", suburb:"Newtown", rating:5.0, trades:18, h:330,
   tagline:"Vintage Base Set and Eeveelutions", home:"holohall", follows:["tom","lena"], since:"2022", followers:67,
   bio:"Building a Base Set binder one Shadowless holo at a time. Will trade modern cards toward vintage.", badges:["Verified ID"],
   cards:{leaf:"trade", g1_65:"sell", g1_130:"trade", g1_2:"own", g1_94:"trade", mew:"sell", vapo:"own"},
   vars:{leaf:"raw", g1_65:"shadow", g1_130:"unl", g1_2:"first", g1_94:"unl", mew:"raw", vapo:"psa9"},
   wants:["g1_6","g1_150","g1_3","sylv","umb"]},
  {id:"chris", name:"Chris L", initials:"CL", suburb:"Parramatta", rating:4.7, trades:92, h:24,
   tagline:"Graded modern, trades most weekends", home:"topdeck", follows:["marcus","dan"], since:"2018", followers:380,
   bio:"Mostly PSA 9 and 10 modern. At Top Deck most Fridays and happy to meet anywhere in western Sydney.", badges:["Verified ID","Ships same day"],
   cards:{char:"trade", g1_9:"trade", gengar:"trade", pika:"sell", esp:"own", g1_149:"sell", jolt:"own"},
   vars:{char:"psa9", g1_9:"unl", gengar:"raw", pika:"psa10", esp:"raw", g1_149:"shadow", jolt:"raw"},
   wants:["umb","ray","lugia","gira","g1_6"]}
];
const PROFILE_KEY = "binderloop.profile";
const PROFILE = (()=>{ let id=null; try{ id=localStorage.getItem(PROFILE_KEY); }catch(e){} return PROFILES.find(p=>p.id===id) || PROFILES[0]; })();
// storage key for a profile; the first profile keeps the original keys so data saved before profiles still loads
const pkeyFor = (p,k) => p===PROFILES[0] ? k : k+"@"+p.id;
const pkey = k => pkeyFor(PROFILE,k);
const me = {
  name:PROFILE.name, initials:PROFILE.initials, suburb:PROFILE.suburb, rating:PROFILE.rating, trades:PROFILE.trades, h:PROFILE.h,
  cards:Object.assign({}, PROFILE.cards), wants:PROFILE.wants.slice()
};
const USERS = [
  {id:"marcus",name:"Marcus T",initials:"MT",suburb:"Parramatta",rating:4.9,trades:63,h:200,
   focus:"Eeveelution alt arts",since:"2021",followers:412,
   bio:"Chasing the full Evolving Skies alt art line. Only two left. Will trade anything outside the Eeveelutions.",
   badges:["Verified ID","Ships same day"],
   cards:{umb:"trade",sylv:"trade",jolt:"trade",flare:"own",vapo:"own",mew:"own"},
   wants:["char","gengar","leaf","esp"]},

  {id:"aisha",name:"Aisha R",initials:"AR",suburb:"Newtown",rating:5.0,trades:21,h:150,
   focus:"Modern alt arts, near mint only",since:"2023",followers:88,
   bio:"New-ish but careful. Everything sleeved and toploaded, photos of every angle before it ships.",
   badges:["Verified ID"],
   cards:{glac:"trade",lugia:"trade",tyra:"trade",pidg:"sell",pika:"own"},
   wants:["g1_9","leaf","gengar"]},

  {id:"dan",name:"Dan K",initials:"DK",suburb:"Penrith",rating:4.6,trades:112,h:20,
   focus:"High volume — everything is available",since:"2019",followers:1240,
   bio:"I trade to keep trading. Nothing in my binder is sacred. Fast replies, blunt offers.",
   badges:["100+ trades","Ships same day"],
   cards:{gira:"trade",ray:"sell",g1_68:"sell",g1_149:"trade",g1_115:"sell",g1_65:"sell"},
   wants:["char","pika","g1_143","g1_9"]},

  {id:"priya",name:"Priya S",initials:"PS",suburb:"Bondi",rating:4.8,trades:8,h:330,
   focus:"Eeveelutions only",since:"2025",followers:31,
   bio:"Started last year with a Sylveon and it got out of hand. Looking for Umbreon, will part with almost anything else.",
   badges:["New collector"],
   cards:{esp:"trade",vapo:"trade",g1_143:"own",pidg:"own"},
   wants:["umb","sylv","glac"]},

  {id:"tom",name:"Tom W",initials:"TW",suburb:"Chatswood",rating:4.4,trades:37,h:110,
   focus:"Vintage base set, raw",since:"2017",followers:205,
   bio:"Only interested in pre-2000 English print. Happy to trade my modern stuff toward vintage.",
   badges:["Verified ID"],
   cards:{g1_3:"trade",gira:"trade",mew:"trade",g1_65:"own"},
   wants:["sylv","gengar","g1_143"]},

  {id:"lena",name:"Lena M",initials:"LM",suburb:"Hurstville",rating:5.0,trades:54,h:258,
   focus:"Graded chase cards",since:"2020",followers:667,
   bio:"PSA and BGS only. I buy more than I trade, but I'll swap sealed and modern for the right slab.",
   badges:["Verified ID","Escrow preferred"],
   cards:{g1_6:"trade",g1_150:"sell",sylv:"trade",ray:"trade"},
   wants:["gengar","g1_9","char","g1_149"]},

  {id:"sam",name:"Sam O",initials:"SO",suburb:"Wollongong",rating:4.7,trades:29,h:60,
   focus:"Jungle and Fossil sets",since:"2022",followers:143,
   bio:"Filling two sets from 1999. Drives up to Sydney for meets most months.",
   badges:["Meets in person"],
   cards:{g1_115:"trade",g1_149:"sell",flare:"trade",g1_68:"own"},
   wants:["g1_143","pika","g1_65","leaf"]}
];
const GEN1 = [
[1,"Bulbasaur","Grass","Base Set","Rare",5.28,110],
[2,"Ivysaur","Grass","Base Set","Uncommon",9.45,110],
[3,"Venusaur","Grass","Base Set","Holo rare",254.17,110],
[4,"Charmander","Fire","Base Set","Uncommon",3.79,16],
[5,"Charmeleon","Fire","Base Set","Rare",6.22,16],
[6,"Charizard","Fire","Base Set","Holo rare",1282.98,16],
[7,"Squirtle","Water","Base Set","Rare",6.95,205],
[8,"Wartortle","Water","Base Set","Uncommon",6.91,205],
[9,"Blastoise","Water","Base Set","Holo rare",328.47,205],
[10,"Caterpie","Bug","Base Set","Common",1.59,80],
[11,"Metapod","Bug","Base Set","Common",1.64,80],
[12,"Butterfree","Bug","Jungle","Uncommon",2.63,80],
[13,"Weedle","Bug","Base Set","Common",1.0,80],
[14,"Kakuna","Bug","Base Set","Common",2.85,80],
[15,"Beedrill","Bug","Base Set","Rare",8.55,80],
[16,"Pidgey","Normal","Base Set","Common",3.15,40],
[17,"Pidgeotto","Normal","Base Set","Common",14.34,40],
[18,"Pidgeot","Normal","Jungle","Holo rare",77.02,40],
[19,"Rattata","Normal","Base Set","Common",1.23,40],
[20,"Raticate","Normal","Base Set","Uncommon",4.0,40],
[21,"Spearow","Normal","Jungle","Common",0.84,40],
[22,"Fearow","Normal","Jungle","Uncommon",1.54,40],
[23,"Ekans","Poison","Fossil","Common",0.77,285],
[24,"Arbok","Poison","Fossil","Uncommon",1.83,285],
[25,"Pikachu","Electric","Jungle","Rare",8.48,48],
[26,"Raichu","Electric","Fossil","Holo rare",65.15,48],
[27,"Sandshrew","Ground","Base Set","Common",1.37,32],
[28,"Sandslash","Ground","Fossil","Uncommon",1.56,32],
[29,"Nidoran\u2640","Poison","Jungle","Common",0.63,285],
[30,"Nidorina","Poison","Jungle","Uncommon",0.8,285],
[31,"Nidoqueen","Poison","Jungle","Holo rare",63.26,285],
[32,"Nidoran\u2642","Poison","Base Set","Common",1.26,285],
[33,"Nidorino","Poison","Base Set","Rare",6.48,285],
[34,"Nidoking","Poison","Base Set","Holo rare",56.28,285],
[35,"Clefairy","Fairy","Base Set","Holo rare",73.89,330],
[36,"Clefable","Fairy","Jungle","Holo rare",54.45,330],
[37,"Vulpix","Fire","Base Set","Common",1.1,16],
[38,"Ninetales","Fire","Base Set","Holo rare",52.98,16],
[39,"Jigglypuff","Fairy","Jungle","Common",2.42,330],
[40,"Wigglytuff","Fairy","Jungle","Holo rare",60.09,330],
[41,"Zubat","Poison","Fossil","Common",0.8,285],
[42,"Golbat","Poison","Fossil","Uncommon",1.17,285],
[43,"Oddish","Grass","Jungle","Common",0.69,110],
[44,"Gloom","Grass","Jungle","Uncommon",1.32,110],
[45,"Vileplume","Grass","Jungle","Holo rare",54.68,110],
[46,"Paras","Bug","Jungle","Common",0.71,80],
[47,"Parasect","Bug","Jungle","Rare",1.59,80],
[48,"Venonat","Bug","Jungle","Common",0.74,80],
[49,"Venomoth","Bug","Jungle","Holo rare",53.54,80],
[50,"Diglett","Ground","Base Set","Common",1.42,32],
[51,"Dugtrio","Ground","Base Set","Rare",16.0,32],
[52,"Meowth","Normal","Jungle","Common",1.39,40],
[53,"Persian","Normal","Jungle","Rare",1.34,40],
[54,"Psyduck","Water","Fossil","Common",2.97,205],
[55,"Golduck","Water","Fossil","Rare",1.99,205],
[56,"Mankey","Fighting","Jungle","Common",0.71,22],
[57,"Primeape","Fighting","Jungle","Rare",2.15,22],
[58,"Growlithe","Fire","Base Set","Common",2.16,16],
[59,"Arcanine","Fire","Base Set","Rare",5.28,16],
[60,"Poliwag","Water","Base Set","Common",1.49,205],
[61,"Poliwhirl","Water","Base Set","Common",2.75,205],
[62,"Poliwrath","Water","Base Set","Holo rare",49.86,205],
[63,"Abra","Psychic","Base Set","Common",2.13,300],
[64,"Kadabra","Psychic","Base Set","Uncommon",3.4,300],
[65,"Alakazam","Psychic","Base Set","Holo rare",97.87,300],
[66,"Machop","Fighting","Base Set","Common",0.99,22],
[67,"Machoke","Fighting","Base Set","Rare",1.6,22],
[68,"Machamp","Fighting","Base Set","Holo rare",70,22],
[69,"Bellsprout","Grass","Jungle","Common",0.83,110],
[70,"Weepinbell","Grass","Jungle","Uncommon",0.96,110],
[71,"Victreebel","Grass","Jungle","Holo rare",66.08,110],
[72,"Tentacool","Water","Fossil","Common",0.86,205],
[73,"Tentacruel","Water","Fossil","Rare",1.49,205],
[74,"Geodude","Rock","Fossil","Common",0.76,28],
[75,"Graveler","Rock","Fossil","Rare",1.52,28],
[76,"Golem","Rock","Fossil","Uncommon",3.33,28],
[77,"Ponyta","Fire","Base Set","Common",0.92,16],
[78,"Rapidash","Fire","Jungle","Uncommon",3.36,16],
[79,"Slowpoke","Water","Fossil","Common",1.44,205],
[80,"Slowbro","Water","Fossil","Uncommon",2.79,205],
[81,"Magnemite","Electric","Base Set","Common",1.16,48],
[82,"Magneton","Electric","Base Set","Holo rare",52.44,48],
[83,"Farfetch'd","Normal","Base Set","Common",1.92,40],
[84,"Doduo","Normal","Base Set","Common",1.83,40],
[85,"Dodrio","Normal","Jungle","Rare",2.37,40],
[86,"Seel","Water","Base Set","Common",1.94,205],
[87,"Dewgong","Water","Base Set","Rare",4.93,205],
[88,"Grimer","Poison","Fossil","Common",0.83,285],
[89,"Muk","Poison","Fossil","Holo rare",16.4,285],
[90,"Shellder","Water","Fossil","Common",0.7,205],
[91,"Cloyster","Water","Fossil","Rare",1.84,205],
[92,"Gastly","Ghost","Fossil","Common",2.1,265],
[93,"Haunter","Ghost","Fossil","Holo rare",74.12,265],
[94,"Gengar","Ghost","Fossil","Holo rare",308.22,265],
[95,"Onix","Rock","Base Set","Common",1.34,28],
[96,"Drowzee","Psychic","Base Set","Common",1.63,300],
[97,"Hypno","Psychic","Fossil","Holo rare",60.4,300],
[98,"Krabby","Water","Fossil","Common",0.7,205],
[99,"Kingler","Water","Fossil","Rare",1.6,205],
[100,"Voltorb","Electric","Base Set","Common",5.71,48],
[101,"Electrode","Electric","Jungle","Holo rare",36.21,48],
[102,"Exeggcute","Grass","Jungle","Common",0.7,110],
[103,"Exeggutor","Grass","Jungle","Rare",2.65,110],
[104,"Cubone","Ground","Jungle","Common",3.23,32],
[105,"Marowak","Ground","Jungle","Rare",2.62,32],
[106,"Hitmonlee","Fighting","Fossil","Holo rare",61.28,22],
[107,"Hitmonchan","Fighting","Base Set","Holo rare",25.94,22],
[108,"Lickitung","Normal","Jungle","Common",2.2,40],
[109,"Koffing","Poison","Base Set","Common",1.36,285],
[110,"Weezing","Poison","Fossil","Uncommon",3.02,285],
[111,"Rhyhorn","Ground","Jungle","Common",0.67,32],
[112,"Rhydon","Ground","Jungle","Uncommon",2.32,32],
[113,"Chansey","Normal","Base Set","Holo rare",92.54,40],
[114,"Tangela","Grass","Base Set","Common",1.29,110],
[115,"Kangaskhan","Normal","Jungle","Holo rare",31.15,40],
[116,"Horsea","Water","Fossil","Common",0.71,205],
[117,"Seadra","Water","Fossil","Rare",1.4,205],
[118,"Goldeen","Water","Jungle","Common",0.82,205],
[119,"Seaking","Water","Jungle","Rare",2.95,205],
[120,"Staryu","Water","Base Set","Common",1.1,205],
[121,"Starmie","Water","Base Set","Rare",1.22,205],
[122,"Mr. Mime","Psychic","Jungle","Holo rare",55.13,300],
[123,"Scyther","Bug","Jungle","Holo rare",84.36,80],
[124,"Jynx","Psychic","Base Set","Uncommon",1.46,300],
[125,"Electabuzz","Electric","Base Set","Rare",14.17,48],
[126,"Magmar","Fire","Fossil","Uncommon",1.64,16],
[127,"Pinsir","Bug","Jungle","Holo rare",45.77,80],
[128,"Tauros","Normal","Jungle","Uncommon",1.74,40],
[129,"Magikarp","Water","Base Set","Rare",4.7,205],
[130,"Gyarados","Water","Base Set","Holo rare",63.99,205],
[131,"Lapras","Water","Fossil","Holo rare",41.03,205],
[132,"Ditto","Normal","Fossil","Holo rare",70.6,40],
[133,"Eevee","Normal","Jungle","Rare",3.73,40],
[134,"Vaporeon","Water","Jungle","Holo rare",70.0,205],
[135,"Jolteon","Electric","Jungle","Holo rare",142.8,48],
[136,"Flareon","Fire","Jungle","Holo rare",135.56,16],
[137,"Porygon","Normal","Base Set","Rare",4.73,40],
[138,"Omanyte","Rock","Fossil","Common",1.74,28],
[139,"Omastar","Rock","Fossil","Rare",1.99,28],
[140,"Kabuto","Rock","Fossil","Common",2.59,28],
[141,"Kabutops","Rock","Fossil","Holo rare",58.39,28],
[142,"Aerodactyl","Rock","Fossil","Holo rare",58.74,28],
[143,"Snorlax","Normal","Jungle","Holo rare",219.45,40],
[144,"Articuno","Ice","Fossil","Holo rare",112.63,190],
[145,"Zapdos","Electric","Fossil","Holo rare",68.38,48],
[146,"Moltres","Fire","Fossil","Holo rare",90.12,16],
[147,"Dratini","Dragon","Base Set","Rare",4.06,250],
[148,"Dragonair","Dragon","Base Set","Uncommon",27.27,250],
[149,"Dragonite","Dragon","Fossil","Holo rare",272.36,250],
[150,"Mewtwo","Psychic","Base Set","Holo rare",133.22,300],
[151,"Mew","Psychic","Black Star Promo","Holo rare",212.67,300]
];

const PRICE_META = {source:"TCGplayer near-mint market price via TCG Price Lookup", asOf:"21 Sep 2026", usdToAud:1.43};
const CURATED = Object.keys(CARDS);
// every Gen 1 Pokemon as a 1999-era card entry
GEN1.forEach(([dex,name,type,set,rar,val,hue])=>{
  CARDS["g1_"+dex] = {n:name, s:set+" · "+rar, v:val, h:hue, dex, type, rar, set};
});
CARDS.g1_68.s += " · price estimate";
// cards any demo profile listed from the catalogue, so saved binders (yours and the other profiles') keep them
PROFILES.forEach(p=>{
  try{ const s=JSON.parse(localStorage.getItem(pkeyFor(p,"binderloop.customcards.v1"))||"null");
    if(s&&typeof s==="object") Object.keys(s).forEach(k=>{ if(k.indexOf("c_")===0&&s[k]&&s[k].cid&&!CARDS[k]) CARDS[k]=s[k]; }); }catch(e){}
});
// the other demo profiles are collectors too, showing the binder and want list they last saved in this browser
PROFILES.filter(p=>p!==PROFILE).forEach(p=>{
  let s=null; try{ s=JSON.parse(localStorage.getItem(pkeyFor(p,"binderloop.web.sell.v1"))||"null"); }catch(e){}
  if(!s||typeof s!=="object") s={};
  const src=s.cards&&typeof s.cards==="object"?s.cards:p.cards, cards={}, vars={};
  for(const k in src) if(CARDS[k]&&["own","trade","sell"].includes(src[k])) cards[k]=src[k];
  const sv=Object.assign({}, p.vars, s.vars&&typeof s.vars==="object"?s.vars:{});
  for(const k in cards) if(sv[k]&&variantsFor(k).some(v=>v.id===sv[k])) vars[k]=sv[k];
  const wants=(Array.isArray(s.wants)?s.wants:p.wants).filter(k=>CARDS[k]);
  USERS.push({id:p.id, demo:true, name:p.name, initials:p.initials, suburb:p.suburb, rating:p.rating, trades:p.trades, h:p.h,
    focus:p.tagline, since:p.since, followers:p.followers, bio:p.bio, badges:p.badges, cards, vars, wants});
});
// give collectors some vintage depth so search shows real owners
const pick=(seed,n)=>{const out=[];let x=seed;for(let i=0;i<n;i++){x=(x*1103515245+12345)%2147483647;out.push("g1_"+(Math.abs(x)%151+1));}return [...new Set(out)];};
USERS.forEach((u,i)=>{
  if(u.demo) return;
  pick(i*977+13,5).forEach((k,j)=>{ if(!u.cards[k]) u.cards[k] = j===0?"sell":j<3?"trade":"own"; });
  pick(i*613+29,3).forEach(k=>{ if(!u.wants.includes(k) && !u.cards[k]) u.wants.push(k); });
});

function variantsFor(k){
  const c = CARDS[k];
  if(c.dex){
    const holo = c.rar==="Holo rare";
    return [{id:"unl",label:"Unlimited",short:"Unlimited",mult:1,note:"the common 1999–2000 print"},
            {id:"shadow",label:"Shadowless",short:"Shadowless",mult:holo?2.4:1.8,note:"no drop shadow, early run"},
            {id:"first",label:"1st Edition",short:"1st Ed",mult:holo?4.6:3.1,note:"stamped, scarce"}];
  }
  return [{id:"raw",label:"Raw, near mint",short:"Raw NM",mult:1,note:"ungraded"},
          {id:"psa9",label:"PSA 9",short:"PSA 9",mult:1.9,note:"mint"},
          {id:"psa10",label:"PSA 10",short:"PSA 10",mult:4.2,note:"gem mint"}];
}
function vOf(k,id){ const vs=variantsFor(k); return vs.find(x=>x.id===id) || vs[0]; }
function valOf(k,id){ return Math.round(CARDS[k].v * vOf(k,id).mult); }
function vchip(k,id){ const v=vOf(k,id); return `<span class="vchip ${v.id}">${v.short}</span>`; }
function vchipOwner(k,o){ return vchip(k, o.vars ? o.vars[k] : undefined); }
const sumV = (set,owner)=>set.reduce((t,k)=>t+valOf(k,owner.vars[k]),0);

// every holding is a specific printing, not just a Pokemon
me.vars = Object.assign({}, PROFILE.vars);
const VARSEED = {
  marcus:{umb:"psa9",sylv:"raw",jolt:"raw",flare:"raw",vapo:"psa9",mew:"raw"},
  aisha:{glac:"psa10",lugia:"raw",tyra:"raw",pidg:"raw",pika:"psa9"},
  dan:{gira:"raw",ray:"raw",g1_68:"unl",g1_149:"unl",g1_115:"unl",g1_65:"unl"},
  priya:{esp:"raw",vapo:"raw",g1_143:"unl",pidg:"raw"},
  tom:{g1_3:"shadow",gira:"raw",mew:"raw",g1_65:"first"},
  lena:{g1_6:"unl",g1_150:"psa9",sylv:"psa9",ray:"psa10"},
  sam:{g1_115:"first",g1_149:"shadow",flare:"raw",g1_68:"unl"}
};
USERS.forEach((u,i)=>{
  u.vars = Object.assign({}, VARSEED[u.id]||{}, u.vars);
  let x = i*7919+31;
  const rnd=()=>{ x=(x*1103515245+12345)&0x7fffffff; return (x%1000)/1000; };
  Object.keys(u.cards).forEach(k=>{
    if(u.vars[k]) return;
    const vs = variantsFor(k), r = rnd();
    u.vars[k] = r>0.88 ? vs[2].id : r>0.68 ? vs[1].id : vs[0].id;
  });
});
Object.keys(me.cards).forEach(k=>{ if(!me.vars[k]) me.vars[k]=variantsFor(k)[0].id; });

// brick-and-mortar stores: trusted handover points that also stock and buy cards
const STORES = [
  {id:"holohall",store:true,name:"Holo Hall",initials:"HH",suburb:"Marrickville",street:"Illawarra Rd",
   geo:[-33.9105,151.1548],h:172,rating:4.9,trades:318,
   hours:"Tue–Sun, 11am–7pm",night:"Thu",nightFull:"Thursday trade night, 6–9pm",tradeIn:0.70,
   fee:"Free under $200, $5 above",
   services:["Staff check both cards before handover","Holds cards for up to 7 days","PSA submission drop-off"],
   blurb:"Neighbourhood shop with six tables out the back. Staff check both cards at the counter before anyone walks away.",
   cards:{glac:"sell",esp:"sell",g1_25:"sell",g1_133:"sell",g1_94:"sell"},
   vars:{glac:"raw",esp:"psa9",g1_25:"unl",g1_133:"first",g1_94:"shadow"},
   wants:["g1_9","char","g1_65"]},
  {id:"topdeck",store:true,name:"Top Deck Collectables",initials:"TD",suburb:"Parramatta",street:"Church St",
   geo:[-33.8148,151.0035],h:24,rating:4.7,trades:540,
   hours:"Mon–Sat, 10am–6pm",night:"Fri",nightFull:"Friday trade night, 5–9pm",tradeIn:0.65,
   fee:"$5 per handover",
   services:["Staff check both cards before handover","Grading advice on request","Holds cards for up to 3 days"],
   blurb:"Biggest Pokémon wall in Western Sydney. Friday nights get busy, so book a table through the app.",
   cards:{umb:"sell",gira:"sell",g1_150:"sell",g1_130:"sell",g1_6:"sell"},
   vars:{umb:"raw",gira:"psa9",g1_150:"unl",g1_130:"shadow",g1_6:"unl"},
   wants:["gengar","leaf","g1_143"]},
  {id:"slab",store:true,name:"Slab & Sleeve",initials:"S&",suburb:"Chatswood",street:"Victoria Ave",
   geo:[-33.7965,151.1815],h:210,rating:5.0,trades:129,
   hours:"Wed–Sun, 12pm–8pm",night:"Sat",nightFull:"Saturday slab swap, 2–5pm",tradeIn:0.75,
   fee:"$10 per graded handover, includes cert check",
   services:["Cert number and case checked on every slab","Private viewing room","Graded cards only above $500"],
   blurb:"Graded specialists. If a slab changes hands here, someone has checked the cert and the case.",
   cards:{g1_6:"sell",umb:"sell",g1_3:"sell",g1_150:"sell"},
   vars:{g1_6:"first",umb:"psa10",g1_3:"first",g1_150:"shadow"},
   wants:["char","g1_149"]}
];
const GEO = {Marrickville:[-33.911,151.155],Parramatta:[-33.815,151.001],Newtown:[-33.897,151.179],
  Penrith:[-33.751,150.694],Bondi:[-33.891,151.277],Chatswood:[-33.797,151.183],
  Hurstville:[-33.967,151.102],Wollongong:[-34.425,150.893]};
const locOf = p => p.geo || GEO[p.suburb];
function km(a,b){
  const [la1,lo1]=locOf(a),[la2,lo2]=locOf(b), r=Math.PI/180;
  const x=Math.sin((la2-la1)*r/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin((lo2-lo1)*r/2)**2;
  return 2*6371*Math.asin(Math.sqrt(x));
}
const kmTxt = d => d<1 ? "under 1 km" : d.toFixed(1)+" km";
let homeStore = PROFILE.home;
function bestStoreFor(u){
  return STORES.slice().sort((a,b)=>{
    const cost=s=>Math.max(km(me,s),km(u,s)) + 0.1*(km(me,s)+km(u,s)) - (s.id===homeStore?1:0);
    return cost(a)-cost(b);
  })[0];
}
const PARTIES = () => [...USERS, ...STORES];
const findParty = id => PARTIES().find(p=>p.id===id);


// community depth for the search screen
const COMMUNITY = {umb:[42,8,12],char:[61,14,19],esp:[37,6,11],ray:[44,9,14],
  glac:[33,7,9],gira:[58,11,17],lugia:[49,10,13],sylv:[36,6,10],gengar:[52,9,15],
  pika:[96,21,27],mew:[64,13,18],leaf:[88,15,24],
  jolt:[41,8,12],flare:[39,7,11],
  vapo:[43,9,12],tyra:[55,12,16],pidg:[57,11,15]};
function community(k){
  if(COMMUNITY[k]) return COMMUNITY[k];
  const c = CARDS[k];
  let h = 7; for(const ch of k) h = (h*31 + ch.charCodeAt(0)) | 0;
  const r = n => Math.abs(h >> n) % 100;
  const owners = Math.max(4, Math.round(520/Math.pow(c.v,0.46)) + r(2)%30);
  const sale = Math.max(1, Math.round(owners*(0.08 + (r(4)%10)/100)));
  const trade = Math.max(1, Math.round(owners*(0.14 + (r(6)%13)/100)));
  return [owners, sale, trade];
}


const $ = s=>document.querySelector(s), $$ = s=>[...document.querySelectorAll(s)];
const money = n=>"$"+(Number.isInteger(n)?n.toLocaleString():n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}));
const avail = u => Object.keys(u.cards).filter(k=>(u.cards[k]==="trade"||u.cards[k]==="sell")&&!(u.noTrade&&u.noTrade[k]));

/* ---------- matching ---------- */
function subsets(arr,max){
  const out=[];
  const walk=(i,cur)=>{ if(cur.length){out.push([...cur]);}
    if(cur.length===max||i===arr.length)return;
    for(let j=i;j<arr.length;j++){cur.push(arr[j]);walk(j+1,cur);cur.pop();}};
  walk(0,[]); return out;
}
const sum = set=>set.reduce((t,k)=>t+CARDS[k].v,0);

function twoWay(){
  const giveable = avail(me), out=[];
  for(const u of PARTIES()){
    const iGive = giveable.filter(k=>u.wants.includes(k));
    const iGet  = avail(u).filter(k=>me.wants.includes(k));
    if(!iGive.length||!iGet.length) continue;
    let best=null;
    for(const a of subsets(iGive,2)) for(const b of subsets(iGet,2)){
      const av_=Math.round(sumV(a,me)*(u.store?u.tradeIn:1)), bv=sumV(b,u), diff=Math.abs(av_-bv);
      const fair = 1 - diff/Math.max(av_,bv);
      const score = fair*1000 + Math.min(av_,bv)/50;
      if(!best||score>best.score) best={give:a,get:b,av:av_,bv,diff,fair,score,user:u};
    }
    if(best && !(u.store && best.fair<0.6)) out.push(best);
  }
  return out.sort((x,y)=>y.score-x.score);
}
function loops(){
  const giveable = avail(me), out=[];
  for(const a of USERS) for(const b of USERS){
    if(a===b) continue;
    const x = giveable.find(k=>a.wants.includes(k));
    const y = avail(a).find(k=>b.wants.includes(k));
    const z = avail(b).find(k=>me.wants.includes(k));
    if(x&&y&&z&&!out.some(l=>l.a===a||l.b===a)) out.push({x,y,z,a,b});
  }
  return out.slice(0,2);
}


function hashOf(k){ let h=9; for(const ch of k) h=(h*31+ch.charCodeAt(0))|0; return Math.abs(h); }
function seriesFor(k){
  const c=CARDS[k]; let h=hashOf(k)||7;
  const rnd=()=>{ h=(h*1103515245+12345)&0x7fffffff; return (h%1000)/1000; };
  const pts=[]; let v=c.v;
  for(let i=0;i<24;i++){
    pts.unshift(Math.max(1, Math.round(v)));
    const drift = 1 + ((rnd()-0.455) * (c.v>200?0.11:0.075));
    v = v/drift;
  }
  return pts;
}

/* ---------- trade nights ---------- */
// weekly schedule for each partner store (matches the nightFull text on each store)
const NIGHT_SCHED = {
  holohall:{dow:4,start:"18:00",end:"21:00"},
  topdeck:{dow:5,start:"17:00",end:"21:00"},
  slab:{dow:6,start:"14:00",end:"17:00"}
};
STORES.forEach(st=>{ st.sched = NIGHT_SCHED[st.id]; });
const DOWS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MONS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const h12 = t=>{ const [h,m]=t.split(":").map(Number); return (((h+11)%12)+1)+(m?":"+String(m).padStart(2,"0"):"")+(h>=12?"pm":"am"); };
const timeRange = s=>{ const a=h12(s.start), b=h12(s.end); return a.slice(-2)===b.slice(-2) ? a.slice(0,-2)+"–"+b : a+"–"+b; };
const fmtDate = d=>DOWS[d.getDay()]+" "+d.getDate()+" "+MONS[d.getMonth()];
const ymd = d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const hsh = s=>{ let h=7; for(const ch of s) h=(h*31+ch.charCodeAt(0))|0; return Math.abs(h); };
function whenText(d){
  const now=new Date(), t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const diff=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-t0)/86400000);
  return diff===0?"Today":diff===1?"Tomorrow":diff<7?"This "+DOWS[d.getDay()]:diff<14?"Next "+DOWS[d.getDay()]:"In "+Math.round(diff/7)+" weeks";
}
// the next n occurrences of a store's weekly night (tonight counts until it finishes)
function nextNights(st,n){
  const s=st.sched, out=[], now=new Date(), [eh,em]=s.end.split(":").map(Number);
  for(let i=0;i<70&&out.length<n;i++){
    const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);
    if(d.getDay()!==s.dow) continue;
    if(i===0 && now.getHours()*60+now.getMinutes()>=eh*60+em) continue;
    out.push({key:st.id+"|"+ymd(d), st, date:d});
  }
  return out;
}
function nightFromKey(key){
  const [sid,ds]=(key||"").split("|"), st=STORES.find(x=>x.id===sid);
  if(!st||!ds) return null;
  const [y,m,d]=ds.split("-").map(Number);
  return {key,st,date:new Date(y,m-1,d)};
}
// your plans: {going: true|false|null, bring:[cardKeys], seek:[cardKeys]}
let NIGHTS = {};
try{ NIGHTS = JSON.parse(localStorage.getItem(pkey("binderloop.nights"))||"{}") || {}; }catch(e){ NIGHTS = {}; }
function saveNights(){ try{ localStorage.setItem(pkey("binderloop.nights"), JSON.stringify(NIGHTS)); }catch(e){} }
function nightPlan(key){
  const p = NIGHTS[key];
  if(!p) return {going:null,bring:[],seek:[]};
  p.bring = (p.bring||[]).filter(k=>CARDS[k]); p.seek = (p.seek||[]).filter(k=>CARDS[k]);
  return p;
}
function editPlan(key){ if(!NIGHTS[key]) NIGHTS[key]={going:null,bring:[],seek:[]}; return nightPlan(key); }
// who else is going: sample collectors, weighted towards people who live close to the store
function attendees(key){
  const st = STORES.find(x=>x.id===key.split("|")[0]), count = 2 + hsh(key)%4;
  return USERS.map(u=>({u,score:hsh(key+u.id)%100 + km(u,st)*1.4})).sort((a,b)=>a.score-b.score).slice(0,count).map(x=>x.u);
}

function listings(){
  const out=[];
  PARTIES().forEach(p=>Object.keys(p.cards).forEach(k=>{
    if(p.cards[k]!=="sell") return;
    const market=valOf(k,p.vars[k]);
    const factor = p.store ? 1.03+(hsh(p.id+k)%8)/100 : 0.90+(hsh(p.id+k)%16)/100;
    out.push({id:p.id+"|"+k, k, seller:p, market, price:Math.max(1,Math.round(market*factor)), diff:Math.round((factor-1)*100), dist:km(me,p)});
  }));
  return out;
}
const diffText = d=>d===0?"at market value":d<0?`${-d}% under market`:`${d}% over market`;


/* ---------- messages: offers and negotiations ---------- */
// Every offer, request and negotiation is a thread. Other people's replies are simulated (no backend in this prototype).
const HR=3600e3, OKEY=pkey("binderloop.offers.v1"), OPEN_ST=["open","agreed"];
let OFFERS=[], threadId=null, draft=null, offerFor=null, offerPrice=null;
const cardNames = ks=>ks.map(k=>CARDS[k].n).join(" + ");
const thread = id=>OFFERS.find(o=>o.id===id);
const partyOf = o=>findParty(o.party);
const effStatus = o=>o.status==="open" && Date.now()>o.expires ? "expired" : o.status;
const needsMe = o=>effStatus(o)==="open" && o.turn==="me";
const isRequested = id=>OFFERS.some(o=>o.listingId===id && OPEN_ST.includes(effStatus(o)));
const ago = t=>{ const m=Math.max(0,Math.round((Date.now()-t)/60000)); return m<1?"now":m<60?m+"m":m<1440?Math.round(m/60)+"h":Math.round(m/1440)+"d"; };
const hoursLeft = o=>Math.max(0,Math.ceil((o.expires-Date.now())/HR));
const newId = ()=>"o"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const snap = o=>({give:(o.give||[]).slice(),get:(o.get||[]).slice(),cash:o.cash});
const trunc = (s,n)=>s.length>n?s.slice(0,n-1)+"…":s;
function saveOffers(){ try{ localStorage.setItem(OKEY,JSON.stringify(OFFERS)); }catch(e){} }

// what each side is putting in, at the values used everywhere else in the app (stores credit trade-ins at their rate)
function totals(o){
  const p=partyOf(o)||{};
  if(o.type==="sell") return {a:o.asking||o.cash,b:o.cash,mine:o.asking||o.cash,theirs:o.cash};
  if(o.type==="buy"||o.type==="hold") return {a:0,b:o.asking||o.cash,mine:o.cash,theirs:o.asking||o.cash};
  const rate = p.store ? p.tradeIn : 1;
  const a=Math.round((o.give||[]).reduce((t,k)=>t+valOf(k,me.vars[k]||variantsFor(k)[0].id),0)*rate);
  const b=(o.get||[]).reduce((t,k)=>t+valOf(k,(p.vars&&p.vars[k])||variantsFor(k)[0].id),0);
  return {a,b,mine:a+Math.max(o.cash,0),theirs:b+Math.max(-o.cash,0)};
}
const fairOf = o=>{ const t=totals(o); return 1-Math.abs(t.mine-t.theirs)/Math.max(t.mine,t.theirs,1); };
const unitFor = n=>n>=100?5:1;
const balanceCash = (party,give,get)=>{ const t=totals({type:"trade",party,give,get,cash:0}), u=unitFor(Math.max(t.a,t.b)); return Math.round((t.b-t.a)/u)*u; };
function cashLine(o){
  const p=partyOf(o), c=o.cash;
  if(o.type==="sell") return `They pay <b>${money(c)}</b>${o.asking&&c!==o.asking?` (your asking price is ${money(o.asking)})`:""}.`;
  if(o.type==="buy"||o.type==="hold") return `You pay <b>${money(c)}</b>${o.asking&&c!==o.asking?` (asking ${money(o.asking)}, ${diffText(Math.round((c/o.asking-1)*100))})`:""}.`;
  if(!c) return "Straight swap, nothing to pay.";
  if(p.store) return c>0?`You pay <b>${money(c)}</b> at the counter.`:`You leave with <b>${money(-c)}</b> in store credit.`;
  return c>0?`You add <b>${money(c)}</b> cash to balance it.`:`They add <b>${money(-c)}</b> cash to balance it.`;
}
const cashShort = (o)=>o.cash? (o.type==="buy"||o.type==="hold"||o.type==="sell" ? money(o.cash) : (o.cash>0?"you add ":"they add ")+money(Math.abs(o.cash))) : "even swap";

/* ---- seed conversations, so the tab has something to track ---- */
function seedOffers(){
  const now=Date.now(), mk=o=>Object.assign({id:newId(),status:"open",turn:"me",created:now,expires:now+48*HR,unread:false,messages:[],simAt:null},o);
  const out=[];
  // A. Marcus has made an offer for your Leafeon VMAX (your reply needed)
  let give=["leaf"], get=["jolt"], cash=balanceCash("marcus",give,get);
  out.push(mk({type:"trade",party:"marcus",give,get,cash,loc:"holohall",turn:"me",unread:true,created:now-3*HR,expires:now+45*HR,
    messages:[{t:now-3*HR,from:"them",text:`Hey ${me.name.split(" ")[0]}! I'm one card off finishing my Eeveelution alt arts and it's your Leafeon VMAX. Would you take my Jolteon VMAX plus cash on top? Happy to do it at Holo Hall on Thursday.`,terms:{give,get,cash}}]}));
  // B. You've offered Dan your Charizard VMAX for his Giratina V (waiting on him)
  give=["char"]; get=["gira"]; cash=balanceCash("dan",give,get);
  out.push(mk({type:"trade",party:"dan",give,get,cash,loc:"topdeck",turn:"them",created:now-20*HR,expires:now+28*HR,
    messages:[{t:now-20*HR,from:"me",text:"Hi Dan, would you swap your Giratina V for my Charizard VMAX (PSA 9), with me adding cash to balance it?",terms:{give,get,cash}}]}));
  // C. A negotiation with Aisha that has gone back and forth (your reply needed)
  give=["g1_9","gengar"]; get=["glac"]; const c1=balanceCash("aisha",give,get), c2=Math.round((c1+100)/5)*5;
  out.push(mk({type:"trade",party:"aisha",give,get,cash:c2,loc:"topdeck",turn:"me",unread:true,created:now-2*24*HR,expires:now+43*HR,
    messages:[
      {t:now-48*HR,from:"me",text:"Hi Aisha, Blastoise and Gengar VMAX for your Glaceon VMAX PSA 10? The values line up within a few dollars.",terms:{give,get,cash:c1}},
      {t:now-44*HR,from:"them",text:"Thanks! Is the Gengar raw or in a toploader? I only take near mint."},
      {t:now-42*HR,from:"me",text:"Raw, near mint, sleeved and toploaded. Happy to show it at the swap."},
      {t:now-5*HR,from:"them",text:`Perfect. It's a PSA 10 slab though, so could you make the top-up ${money(c2)}? I can do Top Deck on Friday.`,terms:{give,get,cash:c2}}]}));
  // D. A store trade-in that's been approved
  give=["g1_65"]; get=["g1_25"]; cash=balanceCash("holohall",give,get);
  out.push(mk({type:"trade",party:"holohall",give,get,cash,loc:"holohall",status:"agreed",turn:null,created:now-24*HR,expires:now+24*HR,
    messages:[
      {t:now-24*HR,from:"me",text:"Hi, I'd like to trade in my Alakazam (Shadowless) for the Pikachu.",terms:{give,get,cash}},
      {t:now-22*HR,from:"them",text:"Approved! We'll hold the Pikachu at the counter and credit the difference to your account. Bring the Alakazam in any time, or to Thursday's trade night."},
      {t:now-22*HR,from:"sys",text:"Holo Hall accepted the offer"}]}));
  // E. An offer Tom turned down
  give=["gengar"]; get=["gira"]; cash=balanceCash("tom",give,get);
  out.push(mk({type:"trade",party:"tom",give,get,cash,loc:"holohall",status:"declined",turn:null,created:now-4*24*HR,expires:now-2*24*HR,
    messages:[
      {t:now-4*24*HR,from:"me",text:"Hi Tom, Gengar VMAX for your Giratina V, with me adding cash?",terms:{give,get,cash}},
      {t:now-3.5*24*HR,from:"them",text:`Thanks ${me.name.split(" ")[0]}, but I'm holding out for a Snorlax and not moving the Giratina otherwise. Good luck!`},
      {t:now-3.5*24*HR,from:"sys",text:"Tom W declined the offer"}]}));
  // each profile only gets the conversations its binder can back up
  return out.filter(o=>o.give.every(k=>me.cards[k]) && o.get.every(k=>findParty(o.party).cards[k]));
}
(function initOffers(){
  const valid = o=>o&&o.id&&Array.isArray(o.messages)&&findParty(o.party)&&(o.give||[]).every(k=>CARDS[k])&&(o.get||[]).every(k=>CARDS[k]);
  try{ const s=JSON.parse(localStorage.getItem(OKEY)||"null"); if(Array.isArray(s)&&s.length&&s.every(valid)) OFFERS=s; }catch(e){}
  if(!OFFERS.length){ OFFERS=seedOffers(); saveOffers(); }
  OFFERS.filter(o=>o.simAt).forEach(o=>schedule(o));
})();

/* ---- simulated replies ---- */
function schedule(o){ setTimeout(()=>simReply(o.id), Math.max(300,o.simAt-Date.now())); }
function queueReply(id,kind,delay){ const o=thread(id); if(!o) return; o.simAt=Date.now()+(delay||5500); o.simKind=kind||"offer"; saveOffers(); schedule(o); }
function nightWhen(st){ const n=nextNights(st,1)[0]; return n?`the ${st.nightFull.split(",")[0]} (${fmtDate(n.date)})`:"one of the trade nights"; }
function simReply(id){
  const o=thread(id); if(!o||!o.simAt) return;
  const kind=o.simKind||"offer"; o.simAt=null; o.simKind=null;
  if(o.status==="agreed"&&kind!=="chat"&&kind!=="ack"){ saveOffers(); return; }
  const p=partyOf(o), first=p.name.split(" ")[0], now=Date.now();
  const say=(text,extra)=>o.messages.push(Object.assign({t:now,from:"them",text},extra||{}));
  const sys=text=>o.messages.push({t:now,from:"sys",text});
  let note="";
  if(kind==="ack"){ say(pick3(o.id,["Brilliant, see you then.","Great, talk soon!","Sounds good to me."])); note=`${first} replied`; }
  else if(kind==="chat"){
    const last=[...o.messages].reverse().find(m=>m.from==="me"&&!m.terms), txt=(last&&last.text||"").toLowerCase();
    say(/thu|fri|sat|meet|night|store/.test(txt)?"Works for me. I'll be there."
      :/cash/.test(txt)?"Cash is fine, keep it to the balance shown on the offer."
      :/print|edition|condition|listed|photo/.test(txt)?"It's exactly as listed, and I'm happy for staff to check it at the handover."
      :"Thanks, I'll get back to you shortly."); note=`${first} replied`;
  }
  else if(o.status==="open"&&o.turn==="them"){
    if(o.type==="loop"){
      o.status="agreed"; o.turn=null; say("I'm in. That's all three legs confirmed."); sys("All three collectors confirmed the loop"); note="Everyone confirmed the loop";
    }else if(o.type==="sell"){
      const k=o.give[0], m=valOf(k,me.vars[k]||variantsFor(k)[0].id), price=o.cash, u=unitFor(m), target=Math.max(1,Math.round(m*0.94/u)*u), st=o.loc&&STORES.find(s=>s.id===o.loc);
      if(!o.countered&&hsh(o.id)%6===0){
        o.status="declined"; o.turn=null; say("Thanks for thinking of me! I actually picked one up last week, so I'll pass."); sys(`${p.name} declined`); note=`${first} declined`;
      }else if(price<=Math.round(m*1.03)||(o.countered&&price<=Math.round(m*1.1))){
        o.status="agreed"; o.turn=null; say(`Yes please! ${money(price)} works for me.${st?` See you at ${st.name} on ${nightWhen(st)}.`:""}`); sys(`${p.name} accepted`); note=`${first} accepted your offer`;
      }else if(!o.countered&&price<=m*1.3){
        o.countered=true; o.cash=Math.min(price-u,target); o.turn="me"; o.expires=now+48*HR;
        say(`I'm keen, but that's a bit above what they're going for. Would you take ${money(o.cash)}?`,{terms:snap(o)}); note=`${first} sent a counter offer`;
      }else{
        o.status="declined"; o.turn=null; say("That's more than I want to spend on it right now, sorry."); sys(`${p.name} declined`); note=`${first} declined your offer`;
      }
    }else if(o.type==="buy"||o.type==="hold"){
      const ask=o.asking, offer=o.cash;
      if(o.type==="hold"||offer>=Math.round(ask*0.96)){
        o.status="agreed"; o.turn=null;
        say(p.store?`Held for you. Pay and collect during opening hours: ${p.hours}.`:`Still available, and it's yours at ${money(offer)}.${o.loc&&o.loc!=="post"?` Let's meet at ${STORES.find(s=>s.id===o.loc).name}.`:""}`);
        sys(`${p.name} accepted`); note=`${first} accepted your request`;
      }else if(offer>=ask*0.8){
        const u=unitFor(ask), mid=Math.max(offer+u,Math.min(ask,Math.round((offer+ask)/2/u)*u));
        o.cash=mid; o.turn="me"; o.expires=now+48*HR; say(`I can't quite do ${money(offer)}. I could do ${money(mid)}.`,{terms:snap(o)}); note=`${first} sent a counter offer`;
      }else{
        o.status="declined"; o.turn=null; say("Sorry, that's too low for me. It's staying at my asking price."); sys(`${p.name} declined`); note=`${first} declined your offer`;
      }
    }else{
      const f=fairOf(o), t=totals(o), okFair=p.store?0.6:0.9;
      if(f>=okFair){
        o.status="agreed"; o.turn=null;
        say(p.store?`Approved. We'll hold ${cardNames(o.get)} at the counter. Bring ${cardNames(o.give)} in to ${nightWhen(p)} or any time we're open.`
          : o.loc&&o.loc!=="post"?`Deal! Let's do it at ${STORES.find(s=>s.id===o.loc).name} on ${nightWhen(STORES.find(s=>s.id===o.loc))}.`
          : "Deal! I'll post mine to the checker as soon as you do.");
        sys(`${p.name} accepted the offer`); note=`${first} accepted your offer`;
      }else if(f>=0.55){
        const c=balanceCash(o.party,o.give,o.get); o.cash=c; o.turn="me"; o.expires=now+48*HR;
        say(`Close! Could we make it ${cashShort(o)}? That evens it out on today's prices.`,{terms:snap(o)}); note=`${first} sent a counter offer`;
      }else{
        o.status="declined"; o.turn=null; say("Thanks for the offer, but that's too far from what I'd need. Good luck finding it!"); sys(`${p.name} declined the offer`); note=`${first} declined your offer`;
      }
    }
  }
  else { saveOffers(); return; }
  o.unread=true; saveOffers(); toast(note,o.id); softRender();
}
const pick3=(seed,arr)=>arr[hsh(seed)%arr.length];

/* ---- creating offers from the rest of the app ---- */
function makeThread(x){
  const now=Date.now(), o=Object.assign({id:newId(),status:"open",turn:"them",created:now,expires:now+48*HR,unread:false,messages:[],simAt:null,give:[],get:[]},x);
  o.messages.push({t:now,from:"me",text:x.text,terms:snap(o)}); delete o.text;
  OFFERS.unshift(o); saveOffers(); queueReply(o.id,"offer"); return o;
}
function sendOffer(i){
  const m=twoWay()[i]; if(!m) return; const u=m.user, loc=u.store?u.id:swapLoc, first=u.name.split(" ")[0], cash=m.bv-m.av;
  const dup=OFFERS.find(o=>o.party===u.id&&o.type==="trade"&&effStatus(o)==="open"&&o.give.join()===m.give.join()&&o.get.join()===m.get.join());
  if(dup){ openThread(dup.id); return; }
  const text=u.store?`Hi, I'd like to trade in ${cardNames(m.give)} for ${cardNames(m.get)}.`
    :`Hi ${first}, would you swap ${cardNames(m.get)} for my ${cardNames(m.give)}${cash?`, with ${cash>0?"me":"you"} adding ${money(Math.abs(cash))} to balance it`:""}?`;
  const o=makeThread({type:"trade",party:u.id,give:m.give.slice(),get:m.get.slice(),cash,loc,text});
  const st=loc&&loc!=="post"?STORES.find(x=>x.id===loc):null;
  offerSent(o,u.store?"Trade-in requested":"Offer sent",
    u.store?`${u.name} will review it. You'll see their reply in Messages.`:`${u.name} has 48 hours to respond${st?`, and you'd meet at ${st.name}`:""}. You'll see their reply in Messages.`);
}
function sendLoop(i){
  const l=loops()[i]; if(!l) return;
  const dup=OFFERS.find(o=>o.type==="loop"&&effStatus(o)==="open"&&o.loop&&o.loop.x===l.x&&o.loop.y===l.y&&o.loop.z===l.z);
  if(dup){ openThread(dup.id); return; }
  const o=makeThread({type:"loop",party:l.a.id,loop:{x:l.x,y:l.y,z:l.z,a:l.a.id,b:l.b.id},give:[l.x],get:[l.z],cash:0,
    text:`I'm in for the three-way loop: my ${CARDS[l.x].n} goes to ${l.a.name.split(" ")[0]}, and I get ${CARDS[l.z].n} from ${l.b.name.split(" ")[0]}.`});
  offerSent(o,"Leg confirmed","The other two have 48 hours to confirm theirs. If one drops out, the loop is cancelled for all three.");
}
function requestBuy(id){
  const l=listings().find(x=>x.id===id); if(!l) return;
  if(isRequested(id)){ openThread(OFFERS.find(o=>o.listingId===id&&OPEN_ST.includes(effStatus(o))).id); return; }
  const s=l.seller, first=s.name.split(" ")[0], st=!s.store&&buyLoc&&buyLoc!=="post"?STORES.find(x=>x.id===buyLoc):null;
  const o=makeThread({type:s.store?"hold":"buy",party:s.id,get:[l.k],give:[],cash:l.price,asking:l.price,listingId:id,loc:s.store?s.id:buyLoc,
    text:s.store?`Hi, could you hold the ${CARDS[l.k].n} (${money(l.price)}) for me?`:`Hi ${first}, I'd like to buy your ${CARDS[l.k].n} for ${money(l.price)}.`});
  offerSent(o,s.store?"Hold requested":"Request sent",
    s.store?`${s.name} will confirm shortly. You'll pay and collect in store.`:`${s.name} has 48 hours to accept. ${st?`You'd meet at ${st.name}. `:""}Nothing is charged until you meet.`);
}
function sendPriceOffer(id){
  const l=listings().find(x=>x.id===id); if(!l) return; const s=l.seller, first=s.name.split(" ")[0], st=buyLoc&&buyLoc!=="post"?STORES.find(x=>x.id===buyLoc):null;
  if(isRequested(id)){ openThread(OFFERS.find(o=>o.listingId===id&&OPEN_ST.includes(effStatus(o))).id); return; }
  const o=makeThread({type:"buy",party:s.id,get:[l.k],give:[],cash:offerPrice,asking:l.price,listingId:id,loc:buyLoc,
    text:`Hi ${first}, would you take ${money(offerPrice)} for your ${CARDS[l.k].n}?`});
  offerSent(o,"Offer sent",`${s.name} has 48 hours to accept, counter or decline.${st?` You'd meet at ${st.name}.`:""}`);
}

/* ---- acting on a thread ---- */
function acceptOffer(id){ const o=thread(id), now=Date.now(); o.status="agreed"; o.turn=null;
  o.messages.push({t:now,from:"me",text:"Accepted. Let's do it."},{t:now,from:"sys",text:"You accepted the offer"}); saveOffers(); queueReply(id,"ack",3500); render(); }
function declineOffer(id){ const o=thread(id), now=Date.now(); o.status="declined"; o.turn=null; o.messages.push({t:now,from:"sys",text:"You declined the offer"}); saveOffers(); render(); }
function withdrawOffer(id){ const o=thread(id), now=Date.now(); o.status="withdrawn"; o.turn=null; o.simAt=null; o.messages.push({t:now,from:"sys",text:"You withdrew the offer"}); saveOffers(); render(); }
function markDone(id){ const o=thread(id), now=Date.now(); o.status="done"; o.messages.push({t:now,from:"sys",text:"Marked as completed"}); saveOffers(); render(); }
function sendMessage(id,text){
  const o=thread(id); if(!o||!text.trim()) return;
  o.messages.push({t:Date.now(),from:"me",text:text.trim()}); saveOffers(); queueReply(id,"chat",3500); softRender();
  const n=$("#tm"); if(n) n.focus();
}
function sendMsgFrom(){ const n=$("#tm"); if(n&&n.value.trim()){ const v=n.value; n.value=""; sendMessage(threadId,v); } }
function planNight(id){
  const o=thread(id), st=STORES.find(s=>s.id===o.loc); if(!st) return; const n=nextNights(st,1)[0]; if(!n) return;
  const p=editPlan(n.key); p.going=true; p.filled=true;
  p.bring=[...new Set([...p.bring,...o.give])]; p.seek=[...new Set([...p.seek,...o.get])]; saveNights(); openNight(n.key);
}

/* ---- counter offers ---- */
function draftToggle(list,k){ draft[list]=draft[list].includes(k)?draft[list].filter(x=>x!==k):[...draft[list],k]; openCounter(draft.id); }
function draftCash(x){ draft.cash+=x; openCounter(draft.id); }
function draftPct(pc){ const o=thread(draft.id); draft.cash=Math.max(1,draft.cash+Math.sign(pc)*Math.max(1,Math.round(o.asking*Math.abs(pc)/100))); openCounter(draft.id); }
function draftBalance(){ const o=thread(draft.id); draft.cash=balanceCash(o.party,draft.give,draft.get); openCounter(draft.id); }
function sendCounter(){
  const o=thread(draft.id), d=draft, now=Date.now(), buy=o.type==="buy"||o.type==="hold"||o.type==="sell";
  o.give=d.give.slice(); o.get=d.get.slice(); o.cash=d.cash; o.turn="them"; o.status="open"; o.expires=now+48*HR;
  const text=d.note.trim()||(buy?`How about ${money(d.cash)}?`:`How about this instead? ${cashShort(o)[0].toUpperCase()+cashShort(o).slice(1)}.`);
  o.messages.push({t:now,from:"me",text,terms:snap(o)});
  draft=null; saveOffers(); queueReply(o.id,"offer"); closeSheet(); render();
}


/* =====================================================================
   Desktop site: helpers, card faces, router and shell
   ===================================================================== */
const esc = s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isHolo = k=>{ const c=CARDS[k]; return isVintagePrint(c) ? c.rar==="Holo rare" : true; };
const first = p=>p.name.split(" ")[0];
Object.values(CARDS).forEach(c=>{ c.s=c.s.replace(/ · /g,", "); });
[...USERS,...STORES].forEach(p=>{ ["focus","bio","blurb"].forEach(f=>{ if(p[f]) p[f]=p[f].replace(/ — /g,", ").replace(/—/g,", "); }); });
let IMG = {};   // card artwork data URIs, keyed by card key (filled in when the artwork pack is available)
let swapLoc=null, buyLoc=null;
const followed = new Set(PROFILE.follows);
function overlap(u){
  const theyHave = avail(u).filter(k=>me.wants.includes(k));
  const theyWant = avail(me).filter(k=>u.wants.includes(k));
  return {theyHave,theyWant,score:theyHave.length*2+theyWant.length};
}
const allNights = ()=>STORES.flatMap(st=>nextNights(st,3)).sort((a,b)=>a.date-b.date||a.st.sched.start.localeCompare(b.st.sched.start));
const holdersOf = k=>USERS.filter(u=>avail(u).includes(k)).length, stockedAt = k=>STORES.filter(st=>st.cards[k]).length;
const ownedSorted = ()=>Object.keys(me.cards).sort((a,b)=>valOf(b,me.vars[b])-valOf(a,me.vars[a]));
const binderValue = ()=>Object.keys(me.cards).reduce((t,k)=>t+valOf(k,me.vars[k]),0);
const plural = (n,w,p)=>n+" "+(n===1?w:(p||w+"s"));

/* ---------- icons ---------- */
const ICON = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
  market:'<path d="M4 8h13"/><path d="m14 4.5 3.5 3.5-3.5 3.5"/><path d="M20 16H7"/><path d="m10 12.5-3.5 3.5 3.5 3.5"/>',
  social:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3 20c0-3.2 2.7-5.8 6-5.8s6 2.6 6 5.8"/><circle cx="17.5" cy="9.5" r="2.4"/><path d="M17 14.4c2.4.2 4.4 2 4.4 4.6"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  you:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  bell:'<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.6 2H4.4z"/><path d="M10 21h4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>',
  chev:'<path d="m9 6 6 6-6 6"/>', left:'<path d="m15 6-6 6 6 6"/>',
  pin:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/>',
  ticket:'<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  send:'<path d="M21 3 10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".9"/><circle cx="4.5" cy="12" r=".9"/><circle cx="4.5" cy="18" r=".9"/>',
  shield:'<path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  filter:'<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
  msg:'<path d="M4 5h16v11H9l-5 4z"/>', loop:'<path d="M17 7H8a4 4 0 0 0 0 8h1"/><path d="m14 4 3 3-3 3"/><path d="M7 17h9a4 4 0 0 0 0-8h-1"/><path d="m10 20-3-3 3-3"/>',
  swap:'<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>', tag:'<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  ext:'<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
};
const ic = (n,s=18)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
const LOGO = `<svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="6" width="14" height="20" rx="2.4" transform="rotate(-9 10 16)" fill="#7A6BFF"/><rect x="14" y="5" width="14" height="20" rx="2.4" transform="rotate(8 21 15)" fill="#5CE1E6"/><path d="M9 21c2 3.5 8 4.5 12 1.5" fill="none" stroke="#FFD84A" stroke-width="2.4" stroke-linecap="round"/><path d="m21.5 19.5.6 3.6-3.5.5" fill="none" stroke="#FFD84A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- card faces ---------- */
// Real artwork is used when the artwork pack is loaded; until then each card gets a generated face.
const vmark = id=>id&&id!=="unl"&&id!=="raw"?`<span class="vm ${id}" title="${{shadow:"Shadowless",first:"1st Edition",psa9:"PSA 9",psa10:"PSA 10"}[id]||""}"></span>`:"";
function cardFace(k,o={}){
  const c=CARDS[k], holo=isHolo(k), img=IMG[k];
  const set = c.set || c.s.split(", ")[0];
  const inner = img ? `<img src="${img}" alt="" draggable="false">`
    : `<span class="cf-top">${esc(c.n)}</span><span class="cf-art"><i>${esc(c.n[0])}</i></span><span class="cf-foot">${esc(set)}</span>`;
  return `<div class="cf${holo?" holo":""}${o.sm?" sm":""}${o.cls?" "+o.cls:""}" style="--h:${c.h}" role="img" aria-label="${esc(c.n)}">${inner}${vmark(o.v)}</div>`;
}
const faceOf = (k,owner,o={})=>cardFace(k,Object.assign({v:owner&&owner.vars?owner.vars[k]:undefined},o));
const av = (u,cls="")=>`<span class="avatar${u.store?" store":""} ${cls}" style="--h:${u.h}" aria-hidden="true">${esc(u.initials)}</span>`;
const vchipOf = (k,owner)=>{ const id=owner&&owner.vars?owner.vars[k]:undefined; return id?`<span class="vchip ${id}">${vOf(k,id).short}</span>`:""; };
const holoChip = k=>isHolo(k)?`<span class="vchip holo">Holo</span>`:"";

/* ---------- modal + toast ---------- */
function openModal(html,o={}){
  const m=$("#modal"); m.innerHTML=`<div class="scrim" onclick="closeModal()"></div><div class="mdl${o.wide?" wide":""}" role="dialog" aria-modal="true" aria-label="${esc(o.label||"Dialog")}" tabindex="-1">${html}</div>`;
  m.classList.add("on"); document.body.classList.add("noscroll"); const f=m.querySelector("[data-autofocus]")||m.querySelector(".mdl"); f.focus({preventScroll:true});
}
function closeModal(){ const m=$("#modal"); m.classList.remove("on"); m.innerHTML=""; document.body.classList.remove("noscroll"); }
const closeSheet = closeModal;
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeModal(); });
function toast(text,id){
  const t=$("#toast"); t.innerHTML=`<span>${esc(text)}</span>${id?`<button class="tlink" onclick="closeToast();openThread('${id}')">View</button>`:""}`;
  t.classList.add("on"); clearTimeout(toast._t); toast._t=setTimeout(closeToast,5200);
}
function closeToast(){ $("#toast").classList.remove("on"); }
const softRender = ()=>render();
function notifyReply(note,id){ toast(note,id); render(); }
function confirmModal(o){
  openModal(`<div class="mdl-c"><div class="tick">${ic("check",26)}</div><h2>${o.title}</h2><p>${o.msg}</p>
    <div class="mdl-actions">${o.primary?`<button class="btn primary" onclick="${o.primary[1]}">${o.primary[0]}</button>`:""}<button class="btn" onclick="closeModal()">${o.close||"Close"}</button></div></div>`,{label:o.title});
}
/* ---------- demo profiles: log in as one of three collectors ---------- */
function openProfiles(){
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <h2>Log in</h2>
    <p class="muted">Pick a demo profile. Each one keeps its own binder, listings, messages and trade nights in this browser.</p>
    <div class="plist">${PROFILES.map(p=>`<button class="lrow prow${p===PROFILE?" on":""}" onclick="switchProfile('${p.id}')" ${p===PROFILE?'aria-current="true" data-autofocus':""}>${av(p)}<div><b>${esc(p.name)}</b><span>${esc(p.tagline)}, ${esc(p.suburb)}</span></div>${p===PROFILE?pill("Signed in"):ic("chev",16)}</button>`).join("")}</div>
    <div class="mdl-actions left"><button class="btn" onclick="go('you','profile')">View ${esc(first(me))}'s profile</button><button class="btn" onclick="resetProfile()">Reset ${esc(first(me))}'s demo data</button></div></div>`,{label:"Log in"});
}
function switchProfile(id){
  if(id===PROFILE.id){ go("home"); return; }
  try{ localStorage.setItem(PROFILE_KEY,id); }catch(e){ toast("This browser won't save the profile, so it can't switch."); return; }
  try{ history.replaceState(null,"","#/app/home"); }catch(e){}
  location.reload();
}
// wipe the signed-in profile's saved data (theme and the other profiles are left alone), back to the sample state
function resetProfile(){
  if(!confirm(`Reset ${me.name}'s binder, listings, messages and trade nights to the demo defaults?`)) return;
  try{
    const mine = k => PROFILE===PROFILES[0] ? !k.includes("@") : k.endsWith("@"+PROFILE.id);
    Object.keys(localStorage).filter(k=>k.startsWith("binderloop.") && k!==PROFILE_KEY && k!=="binderloop.web.theme" && mine(k)).forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  try{ history.replaceState(null,"","#/app/home"); }catch(e){}
  location.reload();
}
function offerSent(o,title,msg){ render(); confirmModal({title,msg,primary:["Open the conversation",`openThread('${o.id}')`]}); }

/* ---------- pointer tilt for holo cards ---------- */
document.addEventListener("pointermove",e=>{
  const t=e.target.closest&&e.target.closest(".tilt"); if(!t) return;
  const r=t.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
  t.style.setProperty("--mx",x.toFixed(3)); t.style.setProperty("--my",y.toFixed(3));
  t.style.setProperty("--rx",((.5-y)*11).toFixed(2)+"deg"); t.style.setProperty("--ry",((x-.5)*14).toFixed(2)+"deg");
});
document.addEventListener("pointerout",e=>{ const t=e.target.closest&&e.target.closest(".tilt"); if(t&&!t.contains(e.relatedTarget)){ t.style.removeProperty("--rx"); t.style.removeProperty("--ry"); } });

/* ---------- theme ---------- */
function setTheme(t){ document.documentElement.setAttribute("data-theme",t); try{ localStorage.setItem("binderloop.web.theme",t); }catch(e){} }
function toggleTheme(){ setTheme(isDark()?"light":"dark"); render(); }
try{ const t=localStorage.getItem("binderloop.web.theme"); if(t) document.documentElement.setAttribute("data-theme",t); }catch(e){}
const isDark = ()=>{ const t=document.documentElement.getAttribute("data-theme"); return t?t==="dark":!!(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches); };

/* ---------- router ---------- */
const PAGES=["home","market","social","search","db","you"];
const TABS={market:["listings","selling","leads","trades","messages"],social:["nights","people","stores"],you:["profile","binder"]};
const S={view:"landing",page:"home",tab:null,sel:null,last:{market:"listings",social:"nights",you:"profile"}};
const hashOf2 = ()=>S.view==="landing"?"#/":"#/app/"+[S.page,S.tab,S.sel].filter(x=>x!=null&&x!=="").map(x=>encodeURIComponent(x)).join("/");
function parseHash(){
  let h=""; try{ h=(location.hash||"").replace(/^#\/?/,""); }catch(e){}
  const p=h.split("/").filter(Boolean).map(decodeURIComponent);
  if(p[0]!=="app"){ S.view="landing"; return; }
  S.view="app"; S.page=PAGES.includes(p[1])?p[1]:"home";
  S.tab=TABS[S.page]?(TABS[S.page].includes(p[2])?p[2]:S.last[S.page]):null; S.sel=p[3]!=null?p[3]:null;
  if(S.tab) S.last[S.page]=S.tab;
}
function setHash(){ try{ const h=hashOf2(); if(location.hash!==h) history.replaceState(null,"",h); }catch(e){} }
function go(page,tab,sel){
  closeModal(); S.view="app"; S.page=page; S.tab=TABS[page]?(tab||S.last[page]):null; S.sel=sel!=null?String(sel):null;
  if(S.tab) S.last[page]=S.tab; setHash(); render(true);
}
function goLanding(sec){ closeModal(); S.view="landing"; setHash(); render(true); if(sec) setTimeout(()=>{ const el=document.getElementById(sec); if(el) el.scrollIntoView({behavior:"smooth"}); },30); }
window.addEventListener("hashchange",()=>{ const before=hashOf2(); parseHash(); if(hashOf2()!==before) render(true); });
const openThread = id=>go("market","messages",id);
const openNight = key=>go("social","nights",key);

/* ---------- render ---------- */
function render(top){
  saveSell();
  const y=window.scrollY, ae=document.activeElement, keep={};
  $$("[data-keep]").forEach(el=>{ keep[el.id]=el.value; });
  const fid=ae&&ae.id&&ae.matches&&ae.matches("input,textarea")?ae.id:null, pos=fid?ae.selectionStart:null;
  $("#root").innerHTML = S.view==="landing" ? landing() : appShell();
  for(const id in keep){ const n=document.getElementById(id); if(n&&n.value!==keep[id]&&n.hasAttribute("data-keep")&&!n.hasAttribute("data-bound")) n.value=keep[id]; }
  if(fid){ const n=document.getElementById(fid); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }
  window.scrollTo(0,top?0:y);
  const log=$("#chatlog"); if(log) log.scrollTop=log.scrollHeight;
  document.title = S.view==="landing" ? "Binder Loop: buy, sell and trade Pokémon cards near you" : "Binder Loop / "+({home:"Home",market:"Marketplace",social:"Social",search:"Search",db:"Database",you:"You"})[S.page];
}

/* ---------- app shell ---------- */
const NAV=[["home","Home","home"],["market","Marketplace","market"],["social","Social","social"],["search","Search","search"],["db","Database","db"],["you","You","you"]];
function navBadge(p){
  if(p==="market"){ const n=OFFERS.filter(needsMe).length; return n?`<span class="badge" title="Offers waiting for your reply">${n}</span>`:""; }
  if(p==="social"){ const n=allNights().filter(x=>nightPlan(x.key).going===true).length; return n?`<span class="badge soft" title="Nights you're going to">${n}</span>`:""; }
  return "";
}
function appShell(){
  const need=OFFERS.filter(needsMe).length, hs=STORES.find(s=>s.id===homeStore);
  return `<div class="app">
  <aside class="side" aria-label="Main">
    <a class="brand" href="#/" onclick="event.preventDefault();goLanding()">${LOGO}<span>Binder Loop</span></a>
    <nav class="nav">${NAV.map(([p,l,i])=>`<a class="nav-a${S.page===p?" on":""}" href="#/app/${p}" onclick="event.preventDefault();go('${p}')" ${S.page===p?'aria-current="page"':""}>${ic(i,20)}<span>${l}</span>${navBadge(p)}</a>`).join("")}</nav>
    <div class="side-foot">
      ${isPremium()?`<button class="prem-side" onclick="go('market','leads')">${ic("spark",16)}<span><b>Premium</b><em>${plural(liveLeads().length,"lead")}</em></span></button>`:`<button class="prem-side free" onclick="openUpgrade()">${ic("spark",16)}<span><b>Try Premium</b><em>Find buyers for your cards</em></span></button>`}
      <button class="home-store" onclick="openStore('${hs.id}')"><span class="hs-l">Your store</span><b>${hs.name}</b><span class="hs-s">${hs.nightFull}</span></button>
      <button class="side-link" onclick="goLanding()">${ic("left",16)}<span>Back to the site</span></button>
    </div>
  </aside>
  <div class="main">
    <header class="top">
      <div class="gsearch">${ic("search",17)}<input id="gs" data-keep placeholder="Search any card or Pokédex number" autocomplete="off" aria-label="Search cards" onkeydown="if(event.key==='Enter')globalSearch(this.value)"></div>
      <span class="sample">Prototype with fictional collectors. Prices are live market data.</span>
      <button class="btn primary sellbtn" onclick="LD.k=null;openListCard(null)">${ic("tag",16)}<span>Sell a card</span></button>
      <button class="icon-btn" onclick="go('market','messages')" aria-label="Messages, ${need} need a reply">${ic("bell",19)}${need?`<span class="dot-n">${need}</span>`:""}</button>
      <button class="icon-btn" onclick="toggleTheme()" aria-label="Switch to ${isDark()?"light":"dark"} theme">${ic(isDark()?"sun":"moon",19)}</button>
      <button class="me-chip" onclick="openProfiles()" aria-label="Signed in as ${esc(me.name)}. Switch profile">${av(me)}<span>${first(me)}</span></button>
    </header>
    <main class="page" id="page">${pageHTML()}</main>
  </div>
</div>`;
}
function globalSearch(v){ F2.q=(v||"").trim(); F2.limit=24; go("search"); const g=$("#gs"); if(g) g.value=""; }
function pageHTML(){
  return ({home:homePage,market:marketPage,social:socialPage,search:searchPage,db:dbPage,you:youPage})[S.page]();
}
function pageHead(title,sub,actions){
  return `<div class="ph"><div><h1>${title}</h1>${sub?`<p>${sub}</p>`:""}</div>${actions?`<div class="ph-actions">${actions}</div>`:""}</div>`;
}
function tabBar(page,defs){
  return `<div class="tabs" role="tablist">${defs.map(([id,l,n])=>`<button role="tab" class="tab${S.tab===id?" on":""}" aria-selected="${S.tab===id}" onclick="go('${page}','${id}')">${l}${n?`<i>${n}</i>`:""}</button>`).join("")}</div>`;
}
const emptyBox = (t,d,a)=>`<div class="empty"><b>${t}</b>${d?`<p>${d}</p>`:""}${a||""}</div>`;

/* =====================================================================
   Home + Marketplace
   ===================================================================== */
const pill = (t,cls="")=>`<span class="pill ${cls}">${t}</span>`;
const facesOf = (ks,owner,o)=>`<div class="faces">${ks.map(k=>`<span class="fw">${faceOf(k,owner,o)}</span>`).join("")}</div>`;
const seeAll = (label,onclick)=>`<button class="link" onclick="${onclick}">${label}${ic("chev",14)}</button>`;
const nightTagText = n=>`${fmtDate(n.date)}, ${timeRange(n.st.sched)}`;

/* ---------- Home ---------- */
function stat(v,l,onclick){ return `<button class="stat" onclick="${onclick}"><b>${v}</b><span>${l}</span></button>`; }
function homePage(){
  const two=twoWay(), lp=loops(), trades=two.length+lp.length, need=OFFERS.filter(needsMe);
  const nights=allNights(), going=nights.filter(n=>nightPlan(n.key).going===true);
  const all=listings(), wantListed=all.filter(l=>me.wants.includes(l.k)).sort((a,b)=>a.diff-b.diff), deals=all.filter(l=>!me.wants.includes(l.k)&&l.price>=40).sort((a,b)=>a.diff-b.diff);
  const wantN=new Set(wantListed.map(l=>l.k)).size;
  const mine=myListings(), askTotal=mine.reduce((t,k)=>t+askOf(k),0), ready=Object.keys(me.cards).filter(k=>me.cards[k]!=="sell"&&buyersFor(k).length);
  const h=new Date().getHours(), greet=h<12?"Good morning":h<18?"Good afternoon":"Good evening";
  const nextN = going[0] || nights.find(n=>n.st.id===homeStore) || nights[0];
  const sub=[wantN?`${plural(wantN,"card")} from your want list ${wantN===1?"is":"are"} for sale nearby`:"",need.length?`${plural(need.length,"offer")} ${need.length===1?"needs":"need"} your reply`:""].filter(Boolean).join(", and ");
  const lt=l=>`<button class="tile" onclick="openListing('${l.id}')"><span class="tile-art tilt">${faceOf(l.k,l.seller)}<span class="sticker">${money(l.price)}</span></span>
      <span class="tile-b"><b>${CARDS[l.k].n}</b><span class="tile-s">${l.seller.name}, ${kmTxt(l.dist)}</span><span class="tile-t">${vchipOf(l.k,l.seller)}${l.diff<=-6?`<span class="tag hit">${-l.diff}% under market</span>`:""}</span></span></button>`;
  return pageHead(`${greet}, ${first(me)}`, sub?sub+".":"Browse what's for sale nearby, or list a card of your own.",
      `<button class="btn" onclick="go('market','listings')">Browse cards for sale</button>`)
  + leadBanner() + `<div class="stats">
      ${stat(wantN+" of "+me.wants.length,"want-list cards for sale nearby","F1.wants=true;go('market','listings')")}
      ${stat(money(askTotal),mine.length?"asking across "+plural(mine.length,"card")+" you're selling":"listed for sale","go('market','selling')")}
      ${stat(need.length,"offers need your reply","go('market','messages')")}
      ${stat(trades,"trades waiting","go('market','trades')")}
    </div>
    <div class="cols-home">
      <div class="col">
        <section class="panel"><div class="panel-h"><h2>For sale from your want list</h2>${seeAll("All listings","F1.wants=true;go('market','listings')")}</div>
          ${wantListed.length?`<div class="tiles four">${wantListed.slice(0,4).map(lt).join("")}</div>`:emptyBox("Nothing on your want list is for sale yet","It'll show here as soon as someone nearby lists one.")}</section>
        <section class="panel"><div class="panel-h"><h2>Good deals nearby</h2>${seeAll("Browse","F1.sort='deal';go('market','listings')")}</div>
          <div class="tiles four">${deals.slice(0,4).map(lt).join("")}</div></section>
      </div>
      <div class="col">
        <section class="panel"><div class="panel-h"><h2>Needs your reply</h2>${seeAll("Messages","go('market','messages')")}</div>
          ${need.length?need.slice(0,3).map(o=>threadRow(o,false)).join(""):emptyBox("You're all caught up","New offers and counter offers appear here.")}</section>
        <section class="panel"><div class="panel-h"><h2>Your listings</h2>${seeAll("Manage","go('market','selling')")}</div>
          ${mine.slice(0,3).map(k=>{ const b=buyersFor(k).length; return `<button class="lrow" onclick="LD.k=null;openListCard('${k}')"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><div><b>${CARDS[k].n} ${vchipOf(k,me)}</b><span>${b?plural(b,"buyer")+" nearby want this":"Listed, nobody on a want list yet"}</span></div><span class="sticker sm">${money(askOf(k))}</span></button>`; }).join("")}
          ${ready.length?`<p class="note">${plural(ready.length,"other card")} in your binder ${ready.length===1?"has":"have"} buyers looking. <button class="link" onclick="go('market','selling')">See which</button></p>`:""}
          ${!mine.length&&!ready.length?emptyBox("You're not selling anything","List a card and buyers nearby will see it.",`<button class="btn primary" onclick="LD.k=null;openListCard(null)">List a card</button>`):""}</section>
        <section class="panel"><div class="panel-h"><h2>Prefer to swap?</h2>${seeAll("All trades","go('market','trades')")}</div>
          <p class="muted" style="margin:-6px 0 12px;font-size:14px">${trades?`${plural(trades,"trade")} could get you cards you want without paying full price.`:"Mark cards as open to trade and we'll look for swaps."}</p>
          ${trades?tradeRow(tradeItems()[0],0,false):""}</section>
        <section class="panel"><div class="panel-h"><h2>${going.length?"Your next trade night":"Next trade night at "+STORES.find(s=>s.id===homeStore).name}</h2>${seeAll("All nights","go('social','nights')")}</div>
          ${nextN?ticketRow(nextN,false):""}</section>
      </div>
    </div>`;
}

/* ---------- Marketplace ---------- */
function tradeItems(){ return [...twoWay().map((m,i)=>({kind:"swap",m,i})),...loops().map((l,i)=>({kind:"loop",l,i}))]; }
function marketPage(){
  const trades=twoWay().length+loops().length, reply=OFFERS.filter(needsMe).length;
  const head = pageHead("Marketplace","Buy and sell cards with collectors and stores near you, or trade when a swap suits you better.")
    + tabBar("market",[["listings","Buy",listings().length],["selling","Sell",myListings().length],["leads",`Leads <span class="prem-badge">${ic("spark",11)}Premium</span>`,isPremium()?newLeads().length||"":""],["trades","Trade",trades],["messages","Messages",reply||""]]);
  return head + (S.tab==="selling"?sellPage():S.tab==="leads"?leadsPage():S.tab==="messages"?messagesPage():S.tab==="trades"?tradesPage():listingsPage());
}
function selTrade(i){ swapLoc=null; go("market","trades",i); }
function setSwapLoc(id){ swapLoc=id; render(); }
function tradeRow(it,idx,active){
  if(it.kind==="loop"){ const l=it.l;
    return `<button class="trow${active?" on":""}" onclick="selTrade(${idx})"><div class="tr-h">${av(l.a)}<div><b>Three-way loop</b><span>with ${l.a.name} and ${l.b.name}</span></div>${pill("Loop","soft")}</div>
      <div class="tr-f">${facesOf([l.x],me)}${ic("loop",16)}${facesOf([l.z],l.b)}<span class="tr-c">nobody needs to want each other's card</span></div></button>`; }
  const m=it.m,u=m.user,even=m.diff<=Math.max(m.av,m.bv)*.06,pct=Math.round(m.fair*100),owed=m.bv-m.av;
  return `<button class="trow${active?" on":""}" onclick="selTrade(${idx})">
    <div class="tr-h">${av(u)}<div><b>${u.name}</b><span>${u.store?"Store in "+u.suburb:u.suburb+", "+kmTxt(km(me,u))}</span></div>${pill(u.store?(even?"Even trade-in":pct+"% trade-in"):(even?"Even swap":pct+"% match"),even?"":"soft")}</div>
    <div class="tr-f">${facesOf(m.give,me)}${ic("swap",16)}${facesOf(m.get,u)}<span class="tr-c">${owed>0?"you add "+money(owed):owed<0?(u.store?"store credit ":"they add ")+money(-owed):"no cash"}</span></div></button>`;
}
function tradesPage(){
  const items=tradeItems();
  const intro=`<p class="muted intro">Trading is optional. When a collector has a card you want and wants one of yours, we suggest a swap, with cash to balance the values.</p>`;
  if(!items.length) return intro+emptyBox("Nothing matches yet","Mark a card in your binder as up for trade, or add cards to your want list, and matches appear here.",`<button class="btn primary" onclick="go('you','binder')">Open your binder</button>`);
  const sel=Math.min(Math.max(+S.sel||0,0),items.length-1);
  const swaps=items.map((it,i)=>[it,i]).filter(([it])=>it.kind==="swap"&&!it.m.user.store), shops=items.map((it,i)=>[it,i]).filter(([it])=>it.kind==="swap"&&it.m.user.store), loopsL=items.map((it,i)=>[it,i]).filter(([it])=>it.kind==="loop");
  const grp=(t,sub,list)=>list.length?`<div class="grp"><h3>${t}</h3><span>${sub}</span></div>${list.map(([it,i])=>tradeRow(it,i,i===sel)).join("")}`:"";
  return intro+`<div class="split">
    <div class="split-l">${grp("Direct swaps","handed over at a partner store",swaps)}${grp("Store trade-ins","they have it in stock and want yours",shops)}${grp("Three-way loops","three collectors, one round trip",loopsL)}</div>
    <div class="split-r">${tradeDetail(items[sel])}</div></div>`;
}
function sideCol(title,ks,owner,total,foot){
  return `<div class="side-col"><h4>${title}</h4>${ks.map(k=>`<button class="cl" onclick="openCard('${k}','${owner.vars[k]||""}')"><span class="fw big">${faceOf(k,owner)}</span><div><b>${CARDS[k].n}</b><span>${vchipOf(k,owner)} ${holoChip(k)}</span><em>${money(valOf(k,owner.vars[k]))}</em></div></button>`).join("")||`<span class="muted">Nothing</span>`}
    <div class="tot"><span>${foot}</span><b>${money(total)}</b></div></div>`;
}
function tradeDetail(it){
  if(it.kind==="loop"){ const l=it.l, dup=OFFERS.find(o=>o.type==="loop"&&effStatus(o)==="open"&&o.loop&&o.loop.x===l.x&&o.loop.y===l.y&&o.loop.z===l.z);
    return `<section class="panel detail"><div class="panel-h"><h2>Three-way loop</h2>${pill("3 collectors","soft")}</div>
      <div class="hops">
        <div class="hop">${faceOf(l.x,me,{sm:true})}<p>You send <b>${CARDS[l.x].n}</b> to <b>${l.a.name}</b></p></div>
        <div class="hop">${faceOf(l.y,l.a,{sm:true})}<p><b>${l.a.name}</b> sends <b>${CARDS[l.y].n}</b> to <b>${l.b.name}</b></p></div>
        <div class="hop">${faceOf(l.z,l.b,{sm:true})}<p><b>${l.b.name}</b> sends <b>${CARDS[l.z].n}</b> to you</p></div>
      </div>
      <p class="note">Nobody in this loop wants what the person before them has, so it only works as a three-way. Everyone confirms before anything ships. If one person drops out, the loop is cancelled for all three.</p>
      <button class="btn primary lg" onclick="${dup?`openThread('${dup.id}')`:`sendLoop(${it.i})`}">${dup?"View my confirmation":"Confirm my leg"}</button></section>`; }
  const m=it.m,u=m.user,owed=m.bv-m.av,pct=Math.round(m.fair*100);
  if(!swapLoc) swapLoc=u.store?u.id:bestStoreFor(u).id;
  const best=bestStoreFor(u), opts=[best,...STORES.filter(x=>x!==best).sort((a,b)=>Math.max(km(me,a),km(u,a))-Math.max(km(me,b),km(u,b)))];
  const dup=OFFERS.find(o=>o.party===u.id&&o.type==="trade"&&effStatus(o)==="open"&&o.give.join()===m.give.join()&&o.get.join()===m.get.join());
  const cashLineD = owed>0?`You add <b>${money(owed)}</b> ${u.store?"at the counter":"in cash to balance it"}.`:owed<0?`${u.store?"The store owes you":"They add"} <b>${money(-owed)}</b>${u.store?" in credit":" in cash to balance it"}.`:"Values line up exactly. No cash either way.";
  return `<section class="panel detail">
    <div class="panel-h"><div class="who">${av(u)}<div><h2>${u.store?"Trade in at "+u.name:"Swap with "+u.name}</h2><span class="muted">${u.store?u.street+", "+u.suburb:u.suburb+", "+kmTxt(km(me,u))+" away, rated "+u.rating+" from "+u.trades+" trades"}</span></div></div>${pill(u.store?pct+"% trade-in":pct+"% match",pct>=94?"":"soft")}</div>
    <div class="sides">${sideCol("You send",m.give,me,m.av,u.store?"Credit at "+Math.round(u.tradeIn*100)+"%":"Total")}<div class="mid">${ic("swap",22)}</div>${sideCol("You get",m.get,u,m.bv,"Total")}</div>
    <p class="balance">${cashLineD}${u.store?" Stores pay under market for what they take in, which is why this reads lower than a collector swap.":""}</p>
    ${u.store?`<div class="handover">${ic("pin",18)}<span><b>${u.name}</b>, ${u.street}. Open ${u.hours}. Staff hold the cards for you once you accept.</span></div>`
    :`<h3 class="sub">Where to swap</h3><div class="opts">${opts.map(st=>{ const nn=nextNights(st,1)[0]; return `<button class="opt${swapLoc===st.id?" on":""}" onclick="setSwapLoc('${st.id}')" aria-pressed="${swapLoc===st.id}">${av(st)}<span><b>${st.name}${st===best?" (fairest trip)":st.id===homeStore?" (your store)":""}</b><em>${st.nightFull}${nn?", next "+fmtDate(nn.date):""}</em></span><span class="rt">${kmTxt(km(me,st))} from you<br>${kmTxt(km(u,st))} from them</span></button>`; }).join("")}
      <button class="opt${swapLoc==="post"?" on":""}" onclick="setSwapLoc('post')" aria-pressed="${swapLoc==="post"}"><span class="avatar plain">${ic("send",16)}</span><span><b>Post both cards to a checker</b><em>Slower, for when nobody can get to a store</em></span><span class="rt">3 to 5 days</span></button></div>
      <p class="note">${swapLoc==="post"?"Both parcels go to the checker, who confirms each card is the exact printing listed before releasing them.":"Store staff check both cards against the listing, including the printing, before either of you leaves."}</p>`}
    <div class="detail-f"><button class="btn primary lg" onclick="${dup?`openThread('${dup.id}')`:`sendOffer(${it.i})`}">${dup?"View my offer":u.store?"Send trade-in request":"Send offer"}</button>
      ${dup?`<span class="muted">You've already offered this. It's in your messages.</span>`:`<span class="muted">${u.store?"They'll review it and reply in Messages.":u.name.split(" ")[0]+" has 48 hours to reply."}</span>`}</div></section>`;
}

/* ---------- Listings ---------- */
const F1={seller:"all",wants:false,holo:false,min:"",max:"",sort:"best"};
function listingsPage(){
  const all=listings(), wantN=all.filter(l=>me.wants.includes(l.k)).length;
  let L=all.slice();
  if(F1.seller==="people") L=L.filter(l=>!l.seller.store); if(F1.seller==="stores") L=L.filter(l=>l.seller.store);
  if(F1.wants) L=L.filter(l=>me.wants.includes(l.k)); if(F1.holo) L=L.filter(l=>isHolo(l.k));
  const mn=+F1.min||0, mx=F1.max===""?Infinity:+F1.max; L=L.filter(l=>l.price>=mn&&l.price<=mx);
  const w=l=>me.wants.includes(l.k)?0:1;
  const sorters={best:(a,b)=>w(a)-w(b)||a.diff-b.diff,low:(a,b)=>a.price-b.price,high:(a,b)=>b.price-a.price,near:(a,b)=>a.dist-b.dist,deal:(a,b)=>a.diff-b.diff};
  L.sort(sorters[F1.sort]);
  const seg=(id,l,n)=>`<button class="opt-s${F1.seller===id?" on":""}" aria-pressed="${F1.seller===id}" onclick="F1.seller='${id}';render()">${l}<i>${n}</i></button>`;
  return `<div class="split-rail">
    <aside class="rail" aria-label="Filters">
      <h3>Seller</h3>${seg("all","Everyone",all.length)}${seg("people","Collectors",all.filter(l=>!l.seller.store).length)}${seg("stores","Partner stores",all.filter(l=>l.seller.store).length)}
      <h3>Show only</h3>
      <button class="opt-s${F1.wants?" on":""}" aria-pressed="${F1.wants}" onclick="F1.wants=!F1.wants;render()">On my want list<i>${wantN}</i></button>
      <button class="opt-s${F1.holo?" on":""}" aria-pressed="${F1.holo}" onclick="F1.holo=!F1.holo;render()">Holographic cards</button>
      <h3>Price</h3>
      <div class="range"><input type="number" min="0" placeholder="Min" aria-label="Minimum price" value="${esc(F1.min)}" onchange="F1.min=this.value;render()"><span>to</span><input type="number" min="0" placeholder="Max" aria-label="Maximum price" value="${esc(F1.max)}" onchange="F1.max=this.value;render()"></div>
      <button class="link" style="margin-top:14px" onclick="Object.assign(F1,{seller:'all',wants:false,holo:false,min:'',max:'',sort:'best'});render()">Clear filters</button>
    </aside>
    <section>
      <div class="rbar"><h2>${plural(L.length,"listing")}</h2><label class="sel">Sort<select onchange="F1.sort=this.value;render()" aria-label="Sort listings">${[["best","Best for you"],["low","Price, low to high"],["high","Price, high to low"],["deal","Biggest discount"],["near","Nearest"]].map(([v,l])=>`<option value="${v}"${F1.sort===v?" selected":""}>${l}</option>`).join("")}</select></label></div>
      ${L.length?`<div class="tiles">${L.map(l=>{ const s=l.seller, req=isRequested(l.id);
        return `<button class="tile" onclick="openListing('${l.id}')"><span class="tile-art tilt">${faceOf(l.k,s)}<span class="sticker">${money(l.price)}</span></span>
          <span class="tile-b"><b>${CARDS[l.k].n}</b><span class="tile-s">${s.name}${s.store?"":", "+s.suburb}, ${kmTxt(l.dist)}</span>
          <span class="tile-t">${vchipOf(l.k,s)}${holoChip(l.k)}${me.wants.includes(l.k)?`<span class="tag want">On your want list</span>`:""}${l.diff<=-6?`<span class="tag hit">${-l.diff}% under market</span>`:""}${req?`<span class="tag">Requested</span>`:""}</span></span></button>`; }).join("")}</div>`
        :emptyBox("No listings match those filters","Try widening the price range or clearing a filter.")}
    </section></div>`;
}
function yourListings(){
  const mine=Object.keys(me.cards).filter(k=>me.cards[k]==="sell").sort((a,b)=>valOf(b,me.vars[b])-valOf(a,me.vars[a]));
  return `<section class="panel" style="margin-top:28px"><div class="panel-h"><h2>Your listings</h2><button class="link" onclick="go('you','binder')">Manage in binder${ic("chev",14)}</button></div>
    ${mine.length?mine.map(k=>{ const n=PARTIES().filter(p=>p.wants.includes(k)).length; return `<button class="lrow" onclick="openCard('${k}')"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><div><b>${CARDS[k].n} ${vchipOf(k,me)}</b><span>${n?plural(n,"collector")+" and stores want this":"Nobody is looking for this yet"}</span></div><span class="sticker sm">${money(valOf(k,me.vars[k]))}</span></button>`; }).join("")
    :emptyBox("You haven't listed anything","Mark a card as Selling in your binder and it appears here.")}</section>`;
}
function openListing(id,loc){
  const l=listings().find(x=>x.id===id); if(!l) return;
  const s=l.seller,k=l.k, th=OFFERS.find(o=>o.listingId===id&&OPEN_ST.includes(effStatus(o)));
  const ti=s.store?-1:twoWay().findIndex(m=>m.user.id===s.id);
  const head=`<div class="mdl-card">${`<div class="tilt">${faceOf(k,s)}</div>`}<div class="mdl-info">
    <h2>${CARDS[k].n}</h2><p class="muted">${CARDS[k].s}</p><div class="chips-l">${vchipOf(k,s)}${holoChip(k)}</div>
    <div class="pricebox"><span class="sticker big">${money(l.price)}</span><span>Market value <b>${money(l.market)}</b>. This listing is <b>${diffText(l.diff)}</b>.${me.wants.includes(k)?" It's on your want list.":""}</span></div>`;
  if(s.store){
    openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button>${head}
      <div class="who" style="margin:14px 0">${av(s)}<div><b>${s.name}</b><span class="muted">${s.street}, ${s.suburb}, ${kmTxt(l.dist)} from you, open ${s.hours}</span></div></div>
      <div class="handover">${ic("pin",18)}<span>Staff hold it for you. Pay and collect at the counter during opening hours.</span></div>
      <div class="mdl-actions left">${th?`<button class="btn primary" data-autofocus onclick="openThread('${th.id}')">View in Messages</button>`:`<button class="btn primary" data-autofocus onclick="requestBuy('${id}')">Ask them to hold it, ${money(l.price)}</button>`}<button class="btn" onclick="openStore('${s.id}')">About ${s.name}</button></div></div></div>`,{wide:true,label:"Listing"});
    return;
  }
  buyLoc = loc || buyLoc || bestStoreFor(s).id;
  const best=bestStoreFor(s), opts=[best,...STORES.filter(x=>x!==best).sort((a,b)=>Math.max(km(me,a),km(s,a))-Math.max(km(me,b),km(s,b)))];
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button>${head}
    <div class="who" style="margin:14px 0 6px">${av(s)}<div><b>${s.name}</b><span class="muted">${s.suburb}, ${kmTxt(l.dist)} away, rated ${s.rating} from ${s.trades} trades</span></div></div>
    <h3 class="sub">Where to meet</h3><div class="opts">${opts.map(st=>`<button class="opt${buyLoc===st.id?" on":""}" onclick="openListing('${id}','${st.id}')" aria-pressed="${buyLoc===st.id}">${av(st)}<span><b>${st.name}${st===best?" (fairest trip)":st.id===homeStore?" (your store)":""}</b><em>${st.nightFull}</em></span><span class="rt">${kmTxt(km(me,st))} you<br>${kmTxt(km(s,st))} them</span></button>`).join("")}
      <button class="opt${buyLoc==="post"?" on":""}" onclick="openListing('${id}','post')" aria-pressed="${buyLoc==="post"}"><span class="avatar plain">${ic("send",16)}</span><span><b>Post it via a checker</b><em>Slower, for when nobody can get to a store</em></span><span class="rt">3 to 5 days</span></button></div>
    <p class="note">${buyLoc==="post"?"The card goes to the checker first, who confirms the exact printing before it's released to you.":"Store staff check the card against the listing, including the printing, before money changes hands."}</p>
    <div class="mdl-actions left">${th?`<button class="btn primary" data-autofocus onclick="openThread('${th.id}')">View in Messages</button>`
      :`<button class="btn primary" data-autofocus onclick="requestBuy('${id}')">Request to buy, ${money(l.price)}</button><button class="btn" onclick="openOffer('${id}')">Make an offer</button>`}
      ${ti>=0?`<button class="btn" onclick="go('market','trades',${ti})">Offer a trade instead</button>`:""}</div></div></div>`,{wide:true,label:"Listing"});
}
function openOffer(id,price){
  const l=listings().find(x=>x.id===id); if(!l) return;
  if(offerFor!==id||offerPrice==null){ const u=unitFor(l.price); offerPrice=Math.max(1,Math.round(l.price*0.9/u)*u); }
  if(price!=null) offerPrice=Math.max(1,price);
  offerFor=id; const s=l.seller, pct=Math.round((offerPrice/l.price-1)*100), step=p=>Math.max(1,offerPrice+Math.sign(p)*Math.max(1,Math.round(l.price*Math.abs(p)/100)));
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <h2>Make an offer to ${s.name}</h2><p class="muted">${CARDS[l.k].n}. Asking ${money(l.price)}, market value ${money(l.market)}.</p>
    <div class="bigprice"><span class="sticker big">${money(offerPrice)}</span><span class="muted">${pct===0?"the asking price":Math.abs(pct)+"% "+(pct<0?"below":"above")+" asking"}</span></div>
    <div class="chips-l" style="margin:6px 0 14px">${[[-10,"−10%"],[-5,"−5%"],[5,"+5%"],[10,"+10%"]].map(([p,t])=>`<button class="chip" onclick="openOffer('${id}',${step(p)})">${t}</button>`).join("")}<button class="chip" onclick="openOffer('${id}',${l.price})">Asking price</button></div>
    <p class="note">Offers well under asking are usually declined. They have 48 hours to reply.</p>
    <div class="mdl-actions left"><button class="btn primary" data-autofocus onclick="sendPriceOffer('${id}')">Send offer, ${money(offerPrice)}</button><button class="btn" onclick="openListing('${id}')">Back</button></div></div>`,{label:"Make an offer"});
}

/* ---------- Messages ---------- */
function statusPill(o){
  const s=effStatus(o);
  return s==="open"&&o.turn==="me"?pill("Your reply","soft"):s==="open"?pill("Waiting on them","muted"):s==="agreed"?pill("Agreed"):s==="done"?pill("Completed"):pill({declined:"Declined",withdrawn:"Withdrawn",expired:"Expired"}[s],"muted");
}
const kindLabel = o=>({trade:o.party&&partyOf(o).store?"Trade-in":"Trade offer",buy:"Purchase",hold:"Store hold",loop:"Three-way loop",sell:o.lead?"Sale, from a lead":"Sale"})[o.type];
function summaryLine(o){
  if(o.type==="loop") return `${CARDS[o.loop.x].n} for ${CARDS[o.loop.z].n}`;
  if(o.type==="buy"||o.type==="hold") return `${CARDS[o.get[0]].n} for ${money(o.cash)}`;
  if(o.type==="sell") return `Selling ${CARDS[o.give[0]].n} for ${money(o.cash)}`;
  return `${cardNames(o.give)||"Nothing"} for ${cardNames(o.get)||"nothing"}, ${cashShort(o)}`;
}
function threadRow(o,active){
  const p=partyOf(o), m=[...o.messages].reverse().find(x=>x.from!=="sys")||o.messages[o.messages.length-1], last=o.messages[o.messages.length-1];
  const name=o.type==="loop"?`Loop with ${first(p)} and ${first(findParty(o.loop.b))}`:p.name;
  return `<button class="trd${active?" on":""}" onclick="openThread('${o.id}')">${av(p)}
    <span class="trd-b"><span class="trd-h"><b>${name}</b>${o.unread?`<span class="udot" aria-label="unread"></span>`:""}<em>${ago(last.t)}</em></span>
      <span class="trd-s">${summaryLine(o)}</span><span class="trd-m">${m.from==="me"?"You: ":""}${esc(trunc(m.text,80))}</span>
      <span class="trd-t">${statusPill(o)}${effStatus(o)==="open"?`<span class="tag">${hoursLeft(o)}h left</span>`:""}</span></span></button>`;
}
function messagesPage(){
  const by=f=>OFFERS.filter(f).sort((a,b)=>b.messages[b.messages.length-1].t-a.messages[a.messages.length-1].t);
  const need=by(needsMe), wait=by(o=>effStatus(o)==="open"&&o.turn==="them"), agreed=by(o=>effStatus(o)==="agreed"), closed=by(o=>["declined","withdrawn","expired","done"].includes(effStatus(o)));
  const cur=thread(S.sel)||need[0]||wait[0]||agreed[0]||closed[0];
  const grp=(t,list)=>list.length?`<div class="grp"><h3>${t}</h3><span>${list.length}</span></div>${list.map(o=>threadRow(o,cur&&o.id===cur.id)).join("")}`:"";
  if(!OFFERS.length) return emptyBox("No offers yet","Send a trade offer or ask to buy a listing and the conversation appears here.");
  if(cur&&cur.unread){ cur.unread=false; saveOffers(); }
  return `<div class="msgs"><section class="mlist" aria-label="Conversations">${grp("Needs your reply",need)}${grp("Waiting on them",wait)}${grp("Agreed",agreed)}${grp("Closed",closed)}</section>
    <section class="chatp">${chatPane(cur)}</section><aside class="mside">${offerSide(cur)}</aside></div>`;
}
function chatPane(o){
  const p=partyOf(o), s=effStatus(o);
  const snapHTML=m=>{ const t=m.terms; if(!t) return ""; if(o.type==="loop") return "";
    if(o.type==="buy"||o.type==="hold"||o.type==="sell") return `<div class="snap"><b>Price</b> ${money(t.cash)}${o.asking?`, ${o.type==="sell"?"your asking price":"asking"} ${money(o.asking)}`:""}</div>`;
    const tmp=Object.assign({},o,{give:t.give,get:t.get,cash:t.cash});
    return `<div class="snap"><b>You send</b> ${cardNames(t.give)||"nothing"}<br><b>You get</b> ${cardNames(t.get)||"nothing"}<br><b>Cash</b> ${cashShort(tmp)}</div>`; };
  const log=o.messages.map(m=>m.from==="sys"?`<div class="sysmsg">${esc(m.text)}, ${ago(m.t)}</div>`
    :`<div class="bub ${m.from==="me"?"me":"them"}">${esc(m.text)}${snapHTML(m)}<span class="bt">${m.from==="me"?"You":first(p)}, ${ago(m.t)}</span></div>`).join("");
  const name=o.type==="loop"?`Loop with ${p.name} and ${findParty(o.loop.b).name}`:p.name;
  return `<header class="chat-h">${av(p)}<div><b>${name}</b><span>${p.store?p.street+", "+p.suburb:p.suburb+", rated "+p.rating+" from "+p.trades+" trades"}</span></div>${statusPill(o)}</header>
    <div class="chatlog" id="chatlog" tabindex="0" aria-label="Conversation">${log}</div>
    ${["open","agreed"].includes(s)?`<div class="quick">${["Can we meet at a trade night?","Is it exactly as listed?","Would you take cash instead?"].map(t=>`<button class="chip" onclick="sendMessage('${o.id}','${t}')">${t}</button>`).join("")}</div>
      <div class="composer"><input id="tm" data-keep placeholder="Message ${first(p)}" autocomplete="off" onkeydown="if(event.key==='Enter')sendMsgFrom()"><button class="btn primary" onclick="sendMsgFrom()">${ic("send",16)}Send</button></div>`
    :`<p class="closed-note">This conversation is closed.</p>`}`;
}
function cline(k,owner){ return `<button class="cl" onclick="openCard('${k}','${owner.vars[k]||""}')"><span class="fw big">${faceOf(k,owner)}</span><div><b>${CARDS[k].n}</b><span>${vchipOf(k,owner)}</span><em>${money(valOf(k,owner.vars[k]))}</em></div></button>`; }
function offerSide(o){
  const p=partyOf(o), s=effStatus(o), mine=needsMe(o);
  let h=`<div class="ms-h"><b>${s==="agreed"?"Agreed terms":mine?"Their offer":"The offer"}</b><span>${kindLabel(o)}${s==="open"?", "+hoursLeft(o)+"h left":""}</span></div>`;
  if(o.type==="loop"){ const l=o.loop,a=findParty(l.a),b=findParty(l.b);
    h+=`<div class="hops"><div class="hop">${faceOf(l.x,me,{sm:true})}<p>You send <b>${CARDS[l.x].n}</b> to ${a.name}</p></div><div class="hop">${faceOf(l.y,a,{sm:true})}<p>${a.name} sends <b>${CARDS[l.y].n}</b> to ${b.name}</p></div><div class="hop">${faceOf(l.z,b,{sm:true})}<p>${b.name} sends <b>${CARDS[l.z].n}</b> to you</p></div></div>`;
  } else if(o.type==="buy"||o.type==="hold"){ h+=cline(o.get[0],p)+`<p class="balance">${cashLine(o)}</p>`;
  } else if(o.type==="sell"){ h+=`<h4>You're selling</h4>`+cline(o.give[0],me)+`<p class="balance">${cashLine(o)}</p>`;
  } else { const t=totals(o), pct=Math.round(fairOf(o)*100);
    h+=`<h4>You send</h4>${o.give.map(k=>cline(k,me)).join("")||`<span class="muted">Nothing</span>`}<div class="tot"><span>${p.store?"Credit at "+Math.round(p.tradeIn*100)+"%":"Total"}</span><b>${money(t.a)}</b></div>
      <h4>You get</h4>${o.get.map(k=>cline(k,p)).join("")||`<span class="muted">Nothing</span>`}<div class="tot"><span>Total</span><b>${money(t.b)}</b></div>
      <p class="balance">${cashLine(o)} ${pill(pct+"% even",pct>=90?"":"soft")}</p>`; }
  if(mine) h+=`<div class="ms-actions"><button class="btn primary" onclick="acceptOffer('${o.id}')">Accept${o.type==="buy"||o.type==="sell"?", "+money(o.cash):""}</button><button class="btn" onclick="draft=null;openCounter('${o.id}')">Counter</button><button class="btn danger" onclick="declineOffer('${o.id}')">Decline</button></div>`;
  else if(s==="open") h+=`<p class="note">Waiting for ${first(p)} to reply. The offer expires in ${hoursLeft(o)} hours.</p><div class="ms-actions"><button class="btn" onclick="withdrawOffer('${o.id}')">Withdraw offer</button></div>`;
  else if(s==="expired") h+=`<p class="note">This offer expired without a reply. Send a new one from Trades or Listings.</p>`;
  if(s==="agreed"){
    const st=o.loc&&o.loc!=="post"?STORES.find(x=>x.id===o.loc):null, n=st&&nextNights(st,1)[0];
    if(st){ const pl=n&&nightPlan(n.key).going===true&&o.give.every(k=>nightPlan(n.key).bring.includes(k));
      h+=`<div class="handover">${ic("pin",18)}<span><b>${st.name}</b>, ${st.street}, ${st.suburb}<br>${n?`Next trade night ${fmtDate(n.date)}, ${timeRange(st.sched)}. `:""}Open ${st.hours}.</span></div>
        ${n?`<button class="btn primary block" onclick="planNight('${o.id}')">${pl?"View my plan for "+fmtDate(n.date):"Add to my "+fmtDate(n.date)+" plan"}</button>`:""}`; }
    else if(o.loc==="post") h+=`<div class="handover">${ic("send",18)}<span>Posting via a checker, 3 to 5 days. The checker confirms the exact printing before releasing anything.</span></div>`;
    h+=o.type==="sell"?`<button class="btn block" onclick="completeSale('${o.id}')">Mark as sold, ${money(o.cash)}</button>`:`<button class="btn block" onclick="markDone('${o.id}')">Mark as done</button>`;
  }
  return h;
}
function sendMsgFrom(){ const n=$("#tm"); if(n&&n.value.trim()){ const v=n.value; n.value=""; sendMessage(S.sel||OFFERS[0].id,v); } }

/* ---------- Counter offers (modal) ---------- */
function openCounter(id){
  const o=thread(id); if(!o) return; const p=partyOf(o), buy=o.type==="buy"||o.type==="hold"||o.type==="sell";
  if(!draft||draft.id!==id) draft={id,give:o.give.slice(),get:o.get.slice(),cash:o.cash,note:""};
  const d=draft, tmp=Object.assign({},o,{give:d.give,get:d.get,cash:d.cash}), t=totals(tmp), pct=Math.round(fairOf(tmp)*100);
  const note=`<label class="field">Add a note (optional)<input id="cn" placeholder="Say why, or suggest a time" value="${esc(d.note)}" oninput="draft.note=this.value"></label>`;
  if(buy){
    const pc=Math.round((d.cash/o.asking-1)*100);
    openModal(`<button class="x" onclick="draft=null;closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>Counter offer</h2>
      <p class="muted">${o.type==="sell"?`Selling your ${CARDS[o.give[0]].n} to ${p.name}. Your asking price is ${money(o.asking)}.`:`${CARDS[o.get[0]].n} from ${p.name}. Asking ${money(o.asking)}.`}</p>
      <div class="bigprice"><span class="sticker big">${money(d.cash)}</span><span class="muted">${pc===0?"the asking price":Math.abs(pc)+"% "+(pc<0?"below":"above")+" asking"}</span></div>
      <div class="chips-l" style="margin:6px 0 14px">${[-10,-5,5,10].map(x=>`<button class="chip" onclick="draftPct(${x})">${x<0?"−":"+"}${Math.abs(x)}%</button>`).join("")}</div>${note}
      <div class="mdl-actions left"><button class="btn primary" onclick="sendCounter()">Send counter, ${money(d.cash)}</button><button class="btn" onclick="draft=null;closeModal()">Cancel</button></div></div>`,{label:"Counter offer"});
    return;
  }
  const mine=[...new Set([...avail(me),...o.give])].sort((a,b)=>valOf(b,me.vars[b])-valOf(a,me.vars[a]));
  const theirs=[...new Set([...avail(p),...o.get])].sort((a,b)=>valOf(b,p.vars[b])-valOf(a,p.vars[a]));
  const pr=(list,k,owner)=>{ const on=d[list].includes(k); return `<button class="pickc${on?" on":""}" aria-pressed="${on}" onclick="draftToggle('${list}','${k}')"><span class="fw big">${faceOf(k,owner)}</span><b>${CARDS[k].n}</b><span>${money(valOf(k,owner.vars[k]))}</span><i class="ck">${on?ic("check",14):""}</i></button>`; };
  openModal(`<button class="x" onclick="draft=null;closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>Counter offer to ${p.name}</h2>
    <p class="muted">Change the cards or the cash. They'll have 48 hours to reply.</p>
    <div class="cnt-cols"><div><h4>You send</h4><div class="pickgrid">${mine.map(k=>pr("give",k,me)).join("")}</div></div><div><h4>You get</h4><div class="pickgrid">${theirs.map(k=>pr("get",k,p)).join("")}</div></div></div>
    <h4>Cash to balance it</h4><div class="chips-l">${[-250,-50,-10,10,50,250].map(x=>`<button class="chip" onclick="draftCash(${x})">${x<0?"−":"+"}$${Math.abs(x)}</button>`).join("")}<button class="chip" onclick="draftBalance()">Balance it</button></div>
    <p class="balance">${cashLine(tmp)} You put in <b>${money(t.mine)}</b> and they put in <b>${money(t.theirs)}</b>${p.store?" (trade-ins are credited at "+Math.round(p.tradeIn*100)+"%)":""}. ${pill(pct+"% even",pct>=90?"":"soft")}</p>${note}
    <div class="mdl-actions left"><button class="btn primary" ${d.give.length+d.get.length?"":"disabled"} onclick="sendCounter()">Send counter</button><button class="btn" onclick="draft=null;closeModal()">Cancel</button></div></div>`,{wide:true,label:"Counter offer"});
}

/* =====================================================================
   Social, Search, You, and the shared modals
   ===================================================================== */

/* ---------- Social ---------- */
function socialPage(){
  if(S.tab==="people"&&S.sel&&USERS.some(u=>u.id===S.sel)) return collectorProfile(S.sel);
  const going=allNights().filter(n=>nightPlan(n.key).going===true).length;
  return pageHead("Social","Trade nights at partner stores, and the collectors you'll meet there.")
    + tabBar("social",[["nights","Trade nights",going?going+" going":""],["people","Collectors",USERS.length],["stores","Partner stores",STORES.length]])
    + (S.tab==="people"?(S.sel&&USERS.some(u=>u.id===S.sel)?collectorProfile(S.sel):peoplePage()):S.tab==="stores"?storesPage():nightsPage());
}
function ticketRow(n,active){
  const p=nightPlan(n.key), going=p.going===true, st=n.st, ppl=attendees(n.key), cnt=ppl.length+(going?1:0);
  const seek=going?p.seek:me.wants, wantHere=[...new Set(ppl.flatMap(u=>avail(u).filter(k=>seek.includes(k))))];
  return `<button class="ticket${going?" going":""}${active?" on":""}" onclick="openNight('${n.key}')">
    <span class="tk-date"><b>${n.date.getDate()}</b><span>${DOWS[n.date.getDay()]}</span></span>
    <span class="tk-b"><b>${st.name}${st.id===homeStore?" (your store)":""}</b><span class="tk-s">${whenText(n.date)}, ${timeRange(st.sched)}, ${kmTxt(km(me,st))} away</span>
      <span class="tk-t"><span class="tag">${cnt} going</span>${going?`<span class="tag want">You're going</span>`:""}${wantHere.length?`<span class="tag hit">${plural(wantHere.length,"card")} you want</span>`:""}</span></span></button>`;
}
let nightFilter="all";
function nightsPage(){
  const all=allNights(), list=nightFilter==="all"?all:all.filter(n=>n.st.id===nightFilter);
  const pick=all.find(n=>n.key===S.sel)||all.find(n=>nightPlan(n.key).going===true)||all[0];
  const t0=new Date(); t0.setHours(0,0,0,0); const wk=n=>{ const d=Math.round((n.date-t0)/86400000); return d<7?"This week":d<14?"Next week":"The week after"; };
  const groups=["This week","Next week","The week after"].map(g=>[g,list.filter(n=>wk(n)===g)]).filter(([,l])=>l.length);
  return `<div class="split"><div class="split-l">
    <div class="chips-l" style="margin-bottom:14px"><button class="chip${nightFilter==="all"?" on":""}" aria-pressed="${nightFilter==="all"}" onclick="nightFilter='all';render()">All stores</button>${STORES.map(s=>`<button class="chip${nightFilter===s.id?" on":""}" aria-pressed="${nightFilter===s.id}" onclick="nightFilter='${s.id}';render()">${s.name}</button>`).join("")}</div>
    ${groups.map(([g,l])=>`<div class="grp"><h3>${g}</h3><span>${plural(l.length,"night")}</span></div>${l.map(n=>ticketRow(n,pick&&n.key===pick.key)).join("")}`).join("")||emptyBox("No nights for this store")}
    </div><div class="split-r">${pick?nightDetail(pick):""}</div></div>`;
}
function setGoing(key,v){
  const p=editPlan(key); p.going=v;
  if(v===true&&!p.filled){ p.bring=avail(me).slice(); p.seek=me.wants.slice(); p.filled=true; }
  saveNights(); render();
}
function toggleIn(key,list,k){ const p=editPlan(key); p[list]=p[list].includes(k)?p[list].filter(x=>x!==k):[...p[list],k]; saveNights(); render(); }
function presetList(key,list,mode){
  const p=editPlan(key);
  if(mode==="clear") p[list]=[]; else if(list==="bring") p.bring=[...new Set([...p.bring,...avail(me)])]; else p.seek=[...new Set([...p.seek,...me.wants])];
  saveNights(); render();
}
function nightSearch(key,q){
  const box=$("#nres"); if(!box) return; q=q.trim().toLowerCase(); const p=nightPlan(key);
  if(!q){ box.innerHTML=""; return; }
  const hits=Object.keys(CARDS).filter(k=>!p.seek.includes(k)&&!me.wants.includes(k)&&(CARDS[k].n.toLowerCase().includes(q)||(CARDS[k].dex&&String(CARDS[k].dex)===q)))
    .sort((a,b)=>(CARDS[a].dex||999)-(CARDS[b].dex||999)||CARDS[b].v-CARDS[a].v).slice(0,6);
  box.innerHTML=hits.length?hits.map(k=>`<button class="prow" onclick="toggleIn('${key}','seek','${k}')"><span class="fw sm">${cardFace(k,{sm:true})}</span><span><b>${esc(CARDS[k].n)}</b><em>${esc(CARDS[k].s)}</em></span><span class="val">${money(CARDS[k].v)}</span><span class="add">${ic("plus",14)}Add</span></button>`).join(""):`<p class="muted" style="padding:8px 0">No card by that name, or it's already on your list.</p>`;
}
function pickRow(key,list,k,owner,on,sub){
  return `<button class="prow${on?" on":""}" aria-pressed="${on}" onclick="toggleIn('${key}','${list}','${k}')"><span class="fw sm">${faceOf(k,owner,{sm:true})}</span><span><b>${CARDS[k].n}</b>${vchipOf(k,owner)}<em>${sub}</em></span><span class="val">${money(owner===me?valOf(k,me.vars[k]):CARDS[k].v)}</span><i class="ck">${on?ic("check",14):""}</i></button>`;
}
function nightDetail(n){
  const st=n.st,key=n.key,p=nightPlan(key),going=p.going===true,ppl=attendees(key),cnt=ppl.length+(going?1:0);
  const mySeek=going?p.seek:me.wants, myBring=going?p.bring:avail(me), label=x=>x==="own"?"Keeping":x==="sell"?"Selling":"Will trade";
  let h=`<section class="panel detail nightd"><div class="nd-h"><span class="tk-date big"><b>${n.date.getDate()}</b><span>${DOWS[n.date.getDay()]} ${MONS[n.date.getMonth()]}</span></span>
    <div><h2>${st.nightFull.split(",")[0]}</h2><p class="muted">${st.name}, ${st.street}, ${st.suburb}. ${timeRange(st.sched)}, ${kmTxt(km(me,st))} from you.</p><p class="muted">${plural(cnt,"collector")} going${going?", including you":""}.</p></div></div>
    <div class="rsvp"><button class="btn lg${p.going===true?" primary":""}" aria-pressed="${p.going===true}" onclick="setGoing('${key}',true)">${p.going===true?ic("check",16)+"I'm going":"I'm going"}</button><button class="btn lg${p.going===false?" on":""}" aria-pressed="${p.going===false}" onclick="setGoing('${key}',false)">Can't make it</button></div>
    <p class="note">${going?"You're on the list. Others can see what you're bringing and what you're after, so they can bring the right cards for you.":esc(st.services[0])+". Tell them you're coming and log your cards so people can plan around you."}</p></section>`;
  if(going){
    const owned=Object.keys(me.cards).sort((a,b)=>valOf(b,me.vars[b])-valOf(a,me.vars[a])), marked=owned.filter(k=>me.cards[k]!=="own"), keeping=owned.filter(k=>me.cards[k]==="own");
    const bringVal=p.bring.reduce((t,k)=>t+(me.cards[k]?valOf(k,me.vars[k]):0),0);
    const wantList=[...new Set([...me.wants,...p.seek])].filter(k=>CARDS[k]).sort((a,b)=>CARDS[b].v-CARDS[a].v);
    h+=`<div class="two"><section class="panel"><div class="panel-h"><h2>Cards I'll bring</h2><span class="muted">${p.bring.length} cards, ${money(bringVal)}</span></div>
        <div class="chips-l" style="margin-bottom:10px"><button class="chip" onclick="presetList('${key}','bring','marked')">Add all I'll trade or sell (${marked.length})</button><button class="chip" onclick="presetList('${key}','bring','clear')">Clear</button></div>
        ${marked.map(k=>pickRow(key,"bring",k,me,p.bring.includes(k),label(me.cards[k]))).join("")}
        ${keeping.length?`<h4 class="sub">Marked as keeping</h4>`+keeping.map(k=>pickRow(key,"bring",k,me,p.bring.includes(k),"Keeping")).join(""):""}</section>
      <section class="panel"><div class="panel-h"><h2>Cards I'm looking for</h2><span class="muted">${p.seek.length} cards</span></div>
        <div class="chips-l" style="margin-bottom:10px"><button class="chip" onclick="presetList('${key}','seek','wants')">Add my whole want list (${me.wants.length})</button><button class="chip" onclick="presetList('${key}','seek','clear')">Clear</button></div>
        ${wantList.map(k=>pickRow(key,"seek",k,{vars:{}},p.seek.includes(k),me.wants.includes(k)?CARDS[k].s:"Added for this night")).join("")}
        <h4 class="sub">Looking for something else?</h4>
        <label class="field"><input id="nq" data-keep placeholder="Search a card to add for this night" autocomplete="off" oninput="nightSearch('${key}',this.value)"></label><div id="nres"></div></section></div>`;
  }
  const there=[]; ppl.forEach(u=>avail(u).forEach(k=>{ if(mySeek.includes(k)) there.push({k,u}); })); Object.keys(st.cards).forEach(k=>{ if(mySeek.includes(k)) there.push({k,u:st}); });
  const wantMine=[]; [...ppl,st].forEach(u=>myBring.forEach(k=>{ if(u.wants.includes(k)) wantMine.push({k,u}); }));
  const basis=going?"from the cards you've logged":"from your want list and cards for trade";
  if(there.length||wantMine.length) h+=`<div class="two">
    <section class="panel"><div class="panel-h"><h2>Cards you want that'll be there</h2><span class="muted">${basis}</span></div>${there.map(({k,u})=>`<button class="lrow" onclick="openCard('${k}','${u.vars[k]||""}')"><span class="fw sm">${faceOf(k,u,{sm:true})}</span><div><b>${CARDS[k].n}</b><span>${u.store?"In stock at "+u.name:u.name+", "+label(u.cards[k])}</span></div><span class="val">${money(valOf(k,u.vars[k]))}</span></button>`).join("")||`<p class="muted">Nobody is bringing anything on your list yet.</p>`}</section>
    <section class="panel"><div class="panel-h"><h2>Your cards people are after</h2><span class="muted">${basis}</span></div>${wantMine.map(({k,u})=>`<div class="lrow"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><div><b>${CARDS[k].n}</b><span>${u.store?u.name+" is buying, trade-in at "+Math.round(u.tradeIn*100)+"%":u.name+" is looking for this"}</span></div><span class="val">${money(valOf(k,me.vars[k]))}</span></div>`).join("")||`<p class="muted">Nobody there wants your cards yet.</p>`}</section></div>`;
  h+=`<section class="panel"><div class="panel-h"><h2>Who's going</h2><span class="muted">${plural(cnt,"collector")}</span></div><div class="people-row">${ppl.map(u=>{ const has=avail(u).filter(k=>mySeek.includes(k)), wants=myBring.filter(k=>u.wants.includes(k));
    return `<button class="pchip" onclick="openCollector('${u.id}')">${av(u)}<span><b>${u.name}</b><em>${u.suburb}, rated ${u.rating}</em><span class="tag-row">${has.length?`<span class="tag hit">Bringing ${has.length} you want</span>`:""}${wants.length?`<span class="tag want">Wants ${wants.length} of yours</span>`:""}${!has.length&&!wants.length?`<span class="tag">No overlap yet</span>`:""}</span></span></button>`; }).join("")}</div></section>`;
  return h;
}
let peopleQ="";
function peoplePage(){
  const q=peopleQ.trim().toLowerCase();
  const ranked=USERS.filter(u=>!q||[u.name,u.suburb,u.focus].some(x=>x.toLowerCase().includes(q))).map(u=>({u,...overlap(u)})).sort((a,b)=>b.score-a.score);
  return `<div class="bigsearch" style="margin-bottom:18px">${ic("search",20)}<input id="cq" placeholder="Search collectors by name, suburb or what they collect" autocomplete="off" value="${esc(peopleQ)}" aria-label="Search collectors" oninput="peopleQ=this.value;render()"></div>`
    + (ranked.length?"":emptyBox(`No collectors match "${esc(peopleQ.trim())}"`,"Try a first name, like Ella, Jonah or Chris, or a suburb."))
    + `<div class="people-grid">${ranked.map(({u,theyHave,theyWant,score})=>{ const owned=Object.keys(u.cards).sort((a,b)=>valOf(b,u.vars[b])-valOf(a,u.vars[a])), val=owned.reduce((t,k)=>t+valOf(k,u.vars[k]),0);
    return `<article class="person"><button class="person-b" onclick="openCollector('${u.id}')">
      <span class="pp-h">${av(u,"lg")}<span><b>${u.name}</b><em>${u.suburb}, rated ${u.rating} from ${u.trades} trades</em></span></span>
      <span class="pp-f">${esc(u.focus)}</span><span class="pp-m">${plural(owned.length,"card")} worth ${money(val)}. Collecting since ${u.since}.</span>
      <span class="pp-strip">${owned.slice(0,5).map(k=>`<span class="fw sm">${faceOf(k,u,{sm:true})}</span>`).join("")}${owned.length>5?`<span class="more">+${owned.length-5}</span>`:""}</span>
      <span class="tag-row">${theyHave.length?`<span class="tag hit">${plural(theyHave.length,"card")} you want</span>`:""}${theyWant.length?`<span class="tag want">Wants ${theyWant.length} of yours</span>`:""}${score===0?`<span class="tag">No overlap yet</span>`:""}${u.demo?`<span class="tag">Demo login</span>`:""}</span></button>
      <button class="btn sm${followed.has(u.id)?"":" primary"}" aria-pressed="${followed.has(u.id)}" onclick="toggleFollow('${u.id}')">${followed.has(u.id)?"Following":"Follow"}</button></article>`; }).join("")}</div>`;
}
function toggleFollow(id){ followed.has(id)?followed.delete(id):followed.add(id); render(); }
function tradeWith(uid){ const i=twoWay().findIndex(m=>m.user.id===uid); if(i>=0) go("market","trades",tradeItems().findIndex(it=>it.kind==="swap"&&it.i===i)); else toast("No balanced trade with them yet. Add a card they want to your binder."); }
function openCollector(id){ go("social","people",id); }
const theirGrid={};
function collectorProfile(id){
  const u=USERS.find(x=>x.id===id), {theyHave,theyWant}=overlap(u), tab=theirGrid[id]||"binder";
  const owned=Object.keys(u.cards).sort((a,b)=>valOf(b,u.vars[b])-valOf(a,u.vars[a]));
  const forSale=owned.filter(k=>u.cards[k]==="sell"), forTrade=owned.filter(k=>u.cards[k]==="trade");
  const val=owned.reduce((t,k)=>t+valOf(k,u.vars[k]),0), can=theyHave.length&&theyWant.length&&twoWay().some(m=>m.user.id===u.id);
  const label=x=>x==="own"?"Keeping":x==="sell"?"For sale":"Will trade", best=bestStoreFor(u);
  const lst=k=>listings().find(l=>l.id===u.id+"|"+k);
  let grid="";
  if(tab==="sale") grid=forSale.map(k=>{ const l=lst(k); return gridTile(k,{v:u.vars[k],price:l?l.price:valOf(k,u.vars[k]),tag:me.wants.includes(k)?"On your want list":vOf(k,u.vars[k]).short,over:`${l?diffText(l.diff):""}<br>Click to buy or make an offer`,click:l?`openListing('${l.id}')`:`openCard('${k}','${u.vars[k]}')`}); }).join("");
  else if(tab==="binder") grid=owned.map(k=>{ const l=u.cards[k]==="sell"&&lst(k), want=me.wants.includes(k);
      return gridTile(k,{v:u.vars[k],price:l?l.price:null,tag:want&&u.cards[k]!=="own"?"On your want list":label(u.cards[k]),
        over:l?`${diffText(l.diff)}<br>Click to buy or make an offer`:`${money(valOf(k,u.vars[k]))} market value${u.cards[k]==="trade"?"<br>Open to trades":""}`,
        click:l?`openListing('${l.id}')`:`openCard('${k}','${u.vars[k]||""}')`}); }).join("");
  else grid=u.wants.map(k=>{ const mine=!!me.cards[k]; return gridTile(k,{tag:mine?"You have one":null,over:mine?`You have one${me.cards[k]==="sell"?`, listed at ${money(askOf(k))}`:""}<br>${me.cards[k]==="sell"&&isPremium()?"Click to message them":"Click to sell it to them"}`:`${money(CARDS[k].v)} market value`,
      click:mine?(me.cards[k]==="sell"&&isPremium()&&openToSellers(u)&&leadState(u,k)==="new"?`openReach('${u.id}','${k}')`:`LD.k=null;openListCard('${k}')`):`openCard('${k}')`}); }).join("");
  const counts={sale:forSale.length,binder:owned.length,wants:u.wants.length};
  const empty = !counts[tab] ? emptyBox(tab==="sale"?`${first(u)} isn't selling anything right now`:tab==="wants"?"No want list yet":"Nothing in their binder yet", tab==="sale"&&forTrade.length?`They have ${plural(forTrade.length,"card")} up for trade. Check the Binder tab.`:"") : "";
  const tabs=[["binder","All cards","grid"],["sale","For sale","tag"],["wants","Looking for","search"]];
  return `<button class="backlink" onclick="go('social','people')">${ic("left",16)}Collectors</button>
    <section class="phead">
      <div class="ph-av">${av(u,"xxl")}</div>
      <div class="ph-main">
        <div class="ph-name"><h2>${u.name}</h2>${u.trades>=20?`<span class="tag hit">${ic("shield",12)}Verified trader</span>`:""}</div>
        <div class="ph-stats"><span><b>${forSale.length}</b> for sale</span><span><b>${u.trades}</b> trades</span><span><b>${u.rating}</b> rating</span><span><b>${u.followers+(followed.has(u.id)?1:0)}</b> followers</span><span>Collecting since <b>${u.since}</b></span></div>
        <p class="ph-bio"><b>${esc(u.focus)}.</b> ${esc(u.bio)}</p>
        <div class="chips-l" style="margin-top:10px">${u.badges.map(b=>`<span class="tag">${esc(b)}</span>`).join("")}</div>
        <div class="ph-acts"><button class="btn${followed.has(u.id)?"":" primary"}" aria-pressed="${followed.has(u.id)}" onclick="toggleFollow('${u.id}')">${followed.has(u.id)?ic("check",15)+"Following":"Follow"}</button>
          ${can?`<button class="btn" onclick="tradeWith('${u.id}')">${ic("swap",15)}See the trade we can do</button>`:""}
          <span class="muted ph-where">${ic("pin",15)}${u.suburb}, ${kmTxt(km(me,u))} from you</span></div>
      </div></section>
    <div class="pcols"><section class="pgrid-w">
      <div class="gtabs" role="tablist">${tabs.map(([t,l,i])=>`<button role="tab" aria-selected="${tab===t}" class="${tab===t?"on":""}" onclick="theirGrid['${u.id}']='${t}';render()">${ic(i,15)}${l}<i>${counts[t]}</i></button>`).join("")}</div>
      ${empty||`<div class="pgrid">${grid}</div>`}
    </section>
    <aside class="pside">
      <section class="panel"><div class="panel-h"><h2>You and ${first(u)}</h2></div>
        <div class="kv two-k"><div><span>They have from your want list</span><b>${theyHave.length}</b></div><div><span>They want from your binder</span><b>${theyWant.length}</b></div></div>
        ${theyHave.map(k=>{ const l=u.cards[k]==="sell"&&lst(k); return `<button class="lrow" onclick="${l?`openListing('${l.id}')`:`openCard('${k}','${u.vars[k]}')`}"><span class="fw sm">${faceOf(k,u,{sm:true})}</span><div><b>${CARDS[k].n}</b><span>${l?"For sale":"Will trade"}</span></div><span class="val">${money(l?l.price:valOf(k,u.vars[k]))}</span></button>`; }).join("")}
        ${theyWant.length?`<p class="note">${first(u)} wants your ${theyWant.map(k=>CARDS[k].n).join(", ")}.</p>`:""}
        ${can?`<button class="btn primary block" onclick="tradeWith('${u.id}')">See the trade we can do</button>`:""}</section>
      <section class="panel"><div class="panel-h"><h2>Where to meet</h2></div><button class="lrow" onclick="openStore('${best.id}')">${av(best)}<div><b>${best.name}</b><span>The fairest trip for you both. ${best.nightFull}.</span></div>${ic("chev",16)}</button></section>
      <section class="panel"><div class="panel-h"><h2>Their collection</h2></div>
        <div class="kv two-k"><div><span>Cards</span><b>${owned.length}</b></div><div><span>Estimated value</span><b>${money(val)}</b></div></div></section>
    </aside></div>`;
}

function storesPage(){
  const W=760,H=480,cx=.83, pts=[...STORES.map(locOf),locOf(me)], la=pts.map(p=>p[0]), lo=pts.map(p=>p[1]);
  const a0=Math.min(...la)-.05,a1=Math.max(...la)+.05,o0=Math.min(...lo)-.07,o1=Math.max(...lo)+.09;
  const spanX=(o1-o0)*cx, spanY=a1-a0, sc=Math.min((W-56)/spanX,(H-56)/spanY), offX=(W-spanX*sc)/2, offY=(H-spanY*sc)/2;
  const X=lon=>(offX+(lon-o0)*cx*sc), Y=lat=>(offY+(a1-lat)*sc), f=n=>n.toFixed(1);
  const gl=[]; for(let a=Math.ceil(a0*20)/20;a<=a1;a+=.05) gl.push(`<line x1="0" x2="${W}" y1="${f(Y(a))}" y2="${f(Y(a))}" class="m-grid"/>`); for(let o=Math.ceil(o0*20)/20;o<=o1;o+=.05) gl.push(`<line y1="0" y2="${H}" x1="${f(X(o))}" x2="${f(X(o))}" class="m-grid"/>`);
  const skip=new Set([me.suburb,...STORES.map(s=>s.suburb)]), bySub={}; USERS.forEach(u=>{ (bySub[u.suburb]=bySub[u.suburb]||[]).push(u); });
  const sub=Object.entries(bySub).filter(([n])=>!skip.has(n)).map(([n,us])=>{ const [a,o]=GEO[n]; return (a<a0||a>a1||o<o0||o>o1)?"":`<g><circle cx="${f(X(o))}" cy="${f(Y(a))}" r="${3+us.length*1.5}" class="m-sub"/><text x="${f(X(o)+10)}" y="${f(Y(a)+4)}" class="m-lbl">${n}</text></g>`; }).join("");
  const stores=STORES.map(st=>{ const [a,o]=locOf(st); return `<g class="m-store"><circle cx="${f(X(o))}" cy="${f(Y(a))}" r="14"/><text x="${f(X(o))}" y="${f(Y(a)+4)}" text-anchor="middle">${esc(st.initials)}</text></g><text class="m-name" x="${f(X(o)+22)}" y="${f(Y(a)+5)}">${esc(st.name)}</text>`; }).join("");
  const [ma,mo]=locOf(me), fiveKm=5/111*sc*1;
  return `<div class="split-map"><section class="panel mapp"><div class="panel-h"><h2>Where the stores are</h2><span class="muted">Schematic map, not to scale</span></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Schematic map of Sydney showing partner stores, collector suburbs and your suburb"><rect x="0" y="0" width="${W}" height="${H}" rx="10" class="m-bg"/>${gl.join("")}${sub}
      <g class="m-me"><circle cx="${f(X(mo))}" cy="${f(Y(ma))}" r="23"/><text x="${f(X(mo))}" y="${f(Y(ma)+41)}" text-anchor="middle">You</text></g>${stores}
      <g><line x1="24" x2="${f(24+fiveKm)}" y1="${H-24}" y2="${H-24}" class="m-scale"/><text x="24" y="${H-30}" class="m-scale-t">5 km</text></g></svg>
    <div class="legend"><span><i class="lg-s"></i>Partner store</span><span><i class="lg-m"></i>You, in ${me.suburb}</span><span><i class="lg-c"></i>Suburbs with collectors</span></div></section>
    <div class="store-list">${STORES.slice().sort((a,b)=>km(me,a)-km(me,b)).map(st=>{ const nx=nextNights(st,4);
      return `<article class="storecard"><button class="sc-h" onclick="openStore('${st.id}')">${av(st)}<span><b>${st.name}${st.id===homeStore?" (your store)":""}</b><em>${st.street}, ${st.suburb}, ${kmTxt(km(me,st))} away</em></span></button>
        <p class="sc-n">${st.nightFull}</p><p class="muted">Open ${st.hours}</p>
        <div class="chips-l">${nx.map(n=>{ const g=nightPlan(n.key).going===true; return `<button class="chip${g?" on":""}" aria-pressed="${g}" onclick="openNight('${n.key}')">${g?ic("check",13):""}${fmtDate(n.date)}</button>`; }).join("")}</div></article>`; }).join("")}</div></div>`;
}
function openStore(id){
  const st=STORES.find(x=>x.id===id), {theyHave,theyWant}=overlap(st), stock=Object.keys(st.cards).sort((a,b)=>valOf(b,st.vars[b])-valOf(a,st.vars[a]));
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button>
    <div class="who lgw">${av(st,"lg")}<div><h2>${st.name}</h2><span class="muted">${st.street}, ${st.suburb}, ${kmTxt(km(me,st))} from you, rated ${st.rating}</span></div></div>
    <p class="bio">${esc(st.blurb)}</p>
    <div class="handover">${ic("ticket",18)}<span><b>${st.nightFull}</b><br>Open ${st.hours}</span></div>
    <div class="stats tight"><div class="stat"><b>${st.trades}</b><span>trades handled</span></div><div class="stat"><b>${Math.round(st.tradeIn*100)}%</b><span>trade-in rate</span></div><div class="stat"><b>${stock.length}</b><span>cards in stock</span></div><div class="stat"><b>${st.fee.split(",")[0]}</b><span>handover fee</span></div></div>
    <h3 class="sub">Upcoming trade nights</h3>${nextNights(st,4).map(n=>{ const g=nightPlan(n.key).going===true; return `<button class="lrow" onclick="openNight('${n.key}')"><span class="tk-date sm${g?" going":""}"><b>${n.date.getDate()}</b><span>${DOWS[n.date.getDay()]}</span></span><div><b>${fmtDate(n.date)}, ${timeRange(st.sched)}</b><span>${g?"You're going":attendees(n.key).length+" going"}</span></div><span class="link">${g?"Edit":"Join"}</span></button>`; }).join("")}
    <h3 class="sub">What they do at handover</h3><ul class="checks">${st.services.map(x=>`<li>${esc(x)}</li>`).join("")}<li>Fee: ${esc(st.fee)}</li></ul>
    ${theyHave.length?`<h3 class="sub">In stock from your want list</h3><div class="pockets sm">${theyHave.map(k=>`<button class="pocket" onclick="openCard('${k}','${st.vars[k]}')"><span class="tilt">${faceOf(k,st)}</span><b>${CARDS[k].n}</b><span>${money(valOf(k,st.vars[k]))}</span></button>`).join("")}</div>`:""}
    <h3 class="sub">All stock</h3><div class="pockets sm">${stock.map(k=>`<button class="pocket" onclick="openCard('${k}','${st.vars[k]}')"><span>${faceOf(k,st)}</span><b>${CARDS[k].n}</b><span>${money(valOf(k,st.vars[k]))}</span></button>`).join("")}</div>
    <h3 class="sub">Buying now</h3><div class="chips-l">${st.wants.map(k=>`<span class="tag ${theyWant.includes(k)?"want":""}">${CARDS[k].n}${theyWant.includes(k)?", you have one":""}</span>`).join("")}</div>
    <div class="mdl-actions left"><button class="btn primary" data-autofocus onclick="setHomeStore('${st.id}')">${homeStore===st.id?"Your home store":"Make this my home store"}</button></div>`,{wide:true,label:st.name});
}
function setHomeStore(id){ homeStore=id; render(); openStore(id); }

/* ---------- Search ---------- */
const F2={q:"",type:"All",holo:false,min:"",max:"",sort:"dex",view:"grid",limit:24,stock:false};
const SORTS=[["dex","Pokédex order"],["high","Price, high to low"],["low","Price, low to high"],["holo","Holographic first"]];
function searchResults(){
  const q=F2.q.trim().toLowerCase(), browseAll=F2.sort!=="dex"||F2.holo||F2.type!=="All"||F2.min!==""||F2.max!==""||F2.stock;
  let pool=Object.keys(CARDS); if(F2.type!=="All") pool=pool.filter(k=>CARDS[k].type===F2.type);
  let hits=pool.filter(k=>{ const c=CARDS[k]; return c.n.toLowerCase().includes(q)||(c.dex&&String(c.dex)===q)||(!q&&(browseAll||c.v>=60)); });
  if(F2.holo) hits=hits.filter(isHolo); if(F2.stock) hits=hits.filter(k=>holdersOf(k)+stockedAt(k)>0);
  const mn=+F2.min||0, mx=F2.max===""?Infinity:+F2.max; hits=hits.filter(k=>CARDS[k].v>=mn&&CARDS[k].v<=mx);
  const byDex=(a,b)=>(CARDS[a].dex||999)-(CARDS[b].dex||999)||CARDS[b].v-CARDS[a].v;
  const sorters={dex:byDex,high:(a,b)=>CARDS[b].v-CARDS[a].v||byDex(a,b),low:(a,b)=>CARDS[a].v-CARDS[b].v||byDex(a,b),holo:(a,b)=>(isHolo(b)-isHolo(a))||CARDS[b].v-CARDS[a].v||byDex(a,b)};
  return hits.sort(sorters[F2.sort]);
}
const TYPES=["All","Fire","Water","Grass","Electric","Psychic","Fighting","Normal","Poison","Ghost","Rock","Ground","Bug","Ice","Dragon","Fairy"];
const activeFilters = ()=>[F2.type!=="All"&&["type",F2.type],F2.holo&&["holo","Holographic"],F2.stock&&["stock","Available to trade or buy"],
  (F2.min!==""||F2.max!=="")&&["price",F2.min!==""&&F2.max!==""?`${money(+F2.min)} to ${money(+F2.max)}`:F2.min!==""?`${money(+F2.min)} and up`:`Up to ${money(+F2.max)}`]].filter(Boolean);
function setF2(patch){ Object.assign(F2,patch,{limit:24}); render(); }
function clearFilter(id){ setF2(id==="type"?{type:"All"}:id==="price"?{min:"",max:""}:{[id]:false}); }
function toggleFilters(v){ F2.open = v==null ? !F2.open : v; render(); if(F2.open){ const f=$(".fpop button"); if(f) f.focus({preventScroll:true}); } }
document.addEventListener("click",e=>{
  if(!F2.open||!document.contains(e.target)) return;
  if(e.target.closest(".fpop")||e.target.closest(".fbtn")) return;
  toggleFilters(false);
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&F2.open){ toggleFilters(false); const b=$(".fbtn"); if(b) b.focus(); } });
function filterPop(n){
  const sw=(on,label,fn)=>`<button class="fsw${on?" on":""}" role="switch" aria-checked="${on}" onclick="${fn}"><span>${label}</span><i></i></button>`;
  return `<div class="fpop" role="dialog" aria-label="Filters">
    <div class="fpop-h"><h3>Filters</h3><button class="icon-btn sm" onclick="toggleFilters(false)" aria-label="Close filters">${ic("x",15)}</button></div>
    <h4>Type</h4><div class="chips-l">${TYPES.map(t=>`<button class="chip${F2.type===t?" on":""}" aria-pressed="${F2.type===t}" onclick="setF2({type:'${t}'})">${t}</button>`).join("")}</div>
    <h4>Show only</h4>${sw(F2.holo,"Holographic cards","setF2({holo:!F2.holo})")}${sw(F2.stock,"Someone has one to trade or sell","setF2({stock:!F2.stock})")}
    <h4>Price</h4><div class="range"><input type="number" min="0" placeholder="Min" aria-label="Minimum price" value="${esc(F2.min)}" onchange="setF2({min:this.value})"><span>to</span><input type="number" min="0" placeholder="Max" aria-label="Maximum price" value="${esc(F2.max)}" onchange="setF2({max:this.value})"></div>
    <div class="fpop-f"><button class="link" onclick="setF2({type:'All',holo:false,stock:false,min:'',max:''})">Clear all</button><button class="btn primary" onclick="toggleFilters(false)">Show ${plural(n,"card")}</button></div></div>`;
}
function searchPage(){
  const hits=searchResults(), shown=hits.slice(0,F2.limit), act=activeFilters();
  const tile=k=>{ const c=CARDS[k], [own,sale,trade]=community(k); return `<button class="tile" onclick="openCard('${k}')"><span class="tile-art tilt">${cardFace(k)}<span class="sticker">${money(c.v)}</span></span>
      <span class="tile-b"><b>${c.n}</b><span class="tile-s">${c.dex?"#"+String(c.dex).padStart(3,"0")+", "+c.type+", ":""}${esc(c.s)}</span>
      <span class="tile-t">${holoChip(k)}<span class="tag">${sale} selling</span><span class="tag">${trade} trading</span>${me.wants.includes(k)?`<span class="tag want">On your want list</span>`:""}</span></span></button>`; };
  const row=k=>{ const c=CARDS[k], [own,sale,trade]=community(k); return `<tr onclick="openCard('${k}')"><td><span class="tcell"><span class="fw sm">${cardFace(k,{sm:true})}</span><span><b>${c.n}</b><em>${c.dex?"#"+String(c.dex).padStart(3,"0")+" "+c.type:""}</em></span></span></td><td>${esc(c.s)}</td><td>${holoChip(k)}</td><td class="num">${money(c.v)}</td><td class="num">${sale}</td><td class="num">${trade}</td><td>${me.wants.includes(k)?`<span class="tag want">Wanted</span>`:`<button class="btn sm" onclick="event.stopPropagation();toggleWant('${k}')">Add to want list</button>`}</td></tr>`; };
  return pageHead("Search","151 Gen 1 cards plus modern chase cards, with prices in AUD.")
  + `<div class="bigsearch">${ic("search",20)}<input id="sq" placeholder="Charizard, Gengar, 143" autocomplete="off" value="${esc(F2.q)}" aria-label="Search cards" oninput="F2.q=this.value;F2.limit=24;render()"></div>
    <div class="rbar"><h2>${plural(hits.length,"card")}</h2>
      <div class="rbar-r">
        <div class="fwrap"><button class="btn fbtn${act.length?" has":""}" aria-expanded="${!!F2.open}" aria-haspopup="dialog" onclick="toggleFilters()">${ic("filter",16)}Filters${act.length?`<i class="fcount">${act.length}</i>`:""}</button>${F2.open?filterPop(hits.length):""}</div>
        <label class="sel">Sort<select onchange="F2.sort=this.value;F2.limit=24;render()" aria-label="Sort cards">${SORTS.map(([v,l])=>`<option value="${v}"${F2.sort===v?" selected":""}>${l}</option>`).join("")}</select></label>
        <div class="viewt" role="group" aria-label="View"><button class="${F2.view==="grid"?"on":""}" aria-pressed="${F2.view==="grid"}" onclick="F2.view='grid';render()" aria-label="Grid view">${ic("grid",17)}</button><button class="${F2.view==="table"?"on":""}" aria-pressed="${F2.view==="table"}" onclick="F2.view='table';render()" aria-label="Table view">${ic("list",17)}</button></div></div></div>
    ${act.length?`<div class="actf">${act.map(([id,l])=>`<button class="chip on" onclick="clearFilter('${id}')" aria-label="Remove filter: ${esc(l)}">${esc(l)}${ic("x",13)}</button>`).join("")}<button class="link" onclick="setF2({type:'All',holo:false,stock:false,min:'',max:''})">Clear all</button></div>`:""}
    ${!hits.length?emptyBox("No cards match","Try a Pokédex number, or remove a filter."):F2.view==="grid"?`<div class="tiles">${shown.map(tile).join("")}</div>`
      :`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Card</th><th>Set</th><th></th><th class="num">Price</th><th class="num">Selling</th><th class="num">Trading</th><th></th></tr></thead><tbody>${shown.map(row).join("")}</tbody></table></div>`}
    ${hits.length>F2.limit?`<div class="more-w"><span class="muted">Showing ${F2.limit} of ${hits.length}</span><button class="btn" onclick="F2.limit+=24;render()">Show 24 more</button></div>`:""}`;
}

/* ---------- Card detail ---------- */
const CM={k:null,v:null,range:12};
function openCard(k,v){ CM.k=k; CM.v=(v&&variantsFor(k).some(x=>x.id===v))?v:(me.vars[k]||variantsFor(k)[0].id); if(!variantsFor(k).some(x=>x.id===CM.v)) CM.v=variantsFor(k)[0].id; renderCard(); }
function setCardVar(v){ CM.v=v; renderCard(); }
function setCardRange(r){ CM.range=r; renderCard(); }
function priceChart(pts){
  const w=560,h=150,pad=8, min=Math.min(...pts), max=Math.max(...pts), span=(max-min)||1, x=i=>pad+i*(w-pad*2)/(pts.length-1), y=v=>pad+(h-pad*2)*(1-(v-min)/span);
  const line=pts.map((v,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" "), area=`${line} L${x(pts.length-1).toFixed(1)},${h-pad} L${pad},${h-pad} Z`, up=pts[pts.length-1]>=pts[0];
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" role="img" aria-label="Simulated price history"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${up?"var(--good)":"var(--warn)"}" stop-opacity=".25"/><stop offset="1" stop-color="${up?"var(--good)":"var(--warn)"}" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#cg)"/><path d="${line}" fill="none" stroke="${up?"var(--good)":"var(--warn)"}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="${x(pts.length-1).toFixed(1)}" cy="${y(pts[pts.length-1]).toFixed(1)}" r="4" fill="${up?"var(--good)":"var(--warn)"}"/></svg>`;
}
function renderCard(){
  const k=CM.k,c=CARDS[k],vs=variantsFor(k),cv=vOf(k,CM.v),shown=valOf(k,CM.v),mult=cv.mult;
  const full=seriesFor(k).map(v=>Math.round(v*mult)), pts=full.slice(-CM.range), now=pts[pts.length-1], then=pts[0], pct=(now-then)/then*100, hi=Math.max(...full), lo=Math.min(...full);
  const [own,sale,trade]=community(k), hold=own-sale-trade, pw=n=>(n/own*100).toFixed(1)+"%";
  const holders=PARTIES().filter(p=>p.cards[k]&&p.cards[k]!=="own");
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button>
  <div class="mdl-card cardm"><div class="cm-art"><div class="tilt">${cardFace(k,{v:CM.v})}</div><p class="muted" style="text-align:center;margin-top:10px">${cv.label}, ${cv.note}</p></div>
  <div class="mdl-info"><h2>${c.n}</h2><p class="muted">${c.dex?"#"+String(c.dex).padStart(3,"0")+", "+c.type+", ":""}${esc(c.s)}</p><div class="chips-l">${holoChip(k)}${me.cards[k]?`<span class="tag hit">In your binder</span>`:""}${me.wants.includes(k)?`<span class="tag want">On your want list</span>`:""}</div>
    <div class="tabs sm" role="tablist" aria-label="Printing">${vs.map(v=>`<button role="tab" class="tab${CM.v===v.id?" on":""}" aria-selected="${CM.v===v.id}" onclick="setCardVar('${v.id}')">${v.label}<i>${money(valOf(k,v.id))}</i></button>`).join("")}</div>
    <div class="cm-price"><span class="sticker big">${money(shown)}</span><span class="${pct>=0?"up":"down"}">${pct>=0?"Up":"Down"} ${Math.abs(pct).toFixed(1)}% over ${CM.range} months</span></div>
    ${priceChart(pts)}<div class="chips-l" style="margin:8px 0 0">${[6,12,24].map(r=>`<button class="chip${CM.range===r?" on":""}" aria-pressed="${CM.range===r}" onclick="setCardRange(${r})">${r} months</button>`).join("")}</div>
    <div class="kv"><div><span>24-month high</span><b>${money(hi)}</b></div><div><span>24-month low</span><b>${money(lo)}</b></div><div><span>Collectors with it</span><b>${own}</b></div></div>
    <div class="bar"><i style="width:${pw(sale)};background:var(--accent)"></i><i style="width:${pw(trade)};background:var(--good)"></i><i style="width:${pw(hold)};background:var(--line)"></i></div>
    <div class="key"><span><i style="background:var(--accent)"></i>${sale} selling</span><span><i style="background:var(--good)"></i>${trade} trading</span><span><i style="background:var(--line)"></i>${hold} keeping</span></div>
    <p class="note">Headline value is the TCGplayer near-mint market price (US$ at 1.43 AUD). The chart is simulated around it, and shadowless, 1st Edition and graded values use estimated multipliers.</p>
    <div class="mdl-actions left"><button class="btn primary" data-autofocus onclick="toggleWant('${k}');renderCard()">${me.wants.includes(k)?"Remove from want list":"Add to want list"}</button>${me.cards[k]?`<button class="btn" onclick="LD.k=null;openListCard('${k}')">${me.cards[k]==="sell"?"Edit my listing, "+money(askOf(k)):"Sell mine"}</button>`:`<button class="btn" onclick="ownCard('${k}','${CM.v}');renderCard()">Add to my binder</button>`}</div></div></div>
  ${holders.length?`<h3 class="sub">Who has one</h3><div class="holders">${holders.map(p=>{ const st=p.cards[k], l=st==="sell"?listings().find(x=>x.id===p.id+"|"+k):null;
    return `<div class="lrow">${av(p)}<div><b>${p.name}</b><span>${p.store?"Partner store":p.suburb}, ${kmTxt(km(me,p))} away, ${st==="sell"?"selling":"will trade"} ${vOf(k,p.vars[k]).short}</span></div><span class="val">${money(valOf(k,p.vars[k]))}</span>${l?`<button class="btn sm primary" onclick="openListing('${l.id}')">${l.seller.store?"Reserve":"Buy"} at ${money(l.price)}</button>`:`<button class="btn sm" onclick="tradeWith('${p.id}')">Offer a trade</button>`}</div>`; }).join("")}</div>`:""}`,{wide:true,label:c.n});
}
function setStatus(k,st){ if(st==="sell"&&me.cards[k]!=="sell"){ LD.k=null; openListCard(k); return; } if(st!=="sell"){ delete SELL.ask[k]; delete SELL.noTrade[k]; } me.cards[k]=st; render(); }
function setVar(k,v){ me.vars[k]=v; render(); }
function toggleWant(k){ me.wants=me.wants.includes(k)?me.wants.filter(x=>x!==k):[...me.wants,k]; render(); }
function ownCard(k,v){ if(!me.cards[k]){ me.cards[k]="own"; me.vars[k]=v&&variantsFor(k).some(x=>x.id===v)?v:variantsFor(k)[0].id; } render(); }
let addQ="";
function openAddCard(q){
  if(q!=null) addQ=q; const s=addQ.trim().toLowerCase();
  const hits=s?Object.keys(CARDS).filter(k=>CARDS[k].n.toLowerCase().includes(s)||(CARDS[k].dex&&String(CARDS[k].dex)===s)).sort((a,b)=>(CARDS[a].dex||999)-(CARDS[b].dex||999)).slice(0,8):[];
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>Add a card</h2><p class="muted">Search the catalogue, then add it to your binder or your want list.</p>
    <div class="bigsearch" style="margin:14px 0"><input id="aq" data-autofocus placeholder="Search by name or Pokédex number" autocomplete="off" value="${esc(addQ)}" oninput="addQ=this.value;openAddCard()" aria-label="Search cards"></div>
    ${hits.map(k=>`<div class="prow static"><span class="fw sm">${cardFace(k,{sm:true})}</span><span><b>${esc(CARDS[k].n)}</b><em>${esc(CARDS[k].s)}</em></span><span class="val">${money(CARDS[k].v)}</span>
      <button class="btn sm" ${me.cards[k]?"disabled":""} onclick="ownCard('${k}');openAddCard()">${me.cards[k]?"In binder":"Add to binder"}</button><button class="btn sm" onclick="toggleWant('${k}');openAddCard()">${me.wants.includes(k)?"On want list":"Add to want list"}</button></div>`).join("")||(s?`<p class="muted">No card by that name.</p>`:"")}</div>`,{label:"Add a card"});
  const n=$("#aq"); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); }
}

/* ---------- You ---------- */
function youPage(){
  return pageHead("You",null) + tabBar("you",[["profile","Profile"],["binder","Binder",Object.keys(me.cards).length]]) + (S.tab==="binder"?binderPage():profilePage());
}
let bFilter="all", bSort="value";
let pGrid="sale";
function gridTile(k,o){
  const c=CARDS[k], v=o.v, sold=o.sold, n=o.n||0;
  return `<button class="gtile${sold?" sold":""}" style="--h:${c.h}" onclick="${o.click}" aria-label="${esc(c.n)}${o.price?", "+money(o.price):""}">
    <span class="g-art tilt">${cardFace(k,{v})}</span>
    ${o.price?`<span class="sticker">${money(o.price)}</span>`:""}${sold?`<span class="g-stamp">Sold</span>`:""}
    ${o.tag?`<span class="g-tag">${o.tag}</span>`:""}
    <span class="g-over"><b>${esc(c.n)}</b><span>${o.over||""}</span></span></button>`;
}
function profilePage(){
  const owned=ownedSorted(), total=binderValue(), hs=STORES.find(x=>x.id===homeStore), mine=myListings();
  const nights=allNights().filter(n=>nightPlan(n.key).going===true), sold=SELL.sold;
  const label=x=>x==="own"?"Keeping":x==="sell"?"For sale":"Will trade";
  let grid="";
  if(pGrid==="sale") grid=`<button class="gtile add" onclick="LD.k=null;openListCard(null)">${ic("plus",28)}<b>List a card</b><span>Show buyers what you've got</span></button>`
    + mine.map(k=>{ const b=buyersFor(k).length; return gridTile(k,{v:me.vars[k],price:askOf(k),tag:vOf(k,me.vars[k]).short,over:`${b?plural(b,"buyer")+" want this":"Listed"}<br>Click to edit`,click:`LD.k=null;openListCard('${k}')`}); }).join("");
  else if(pGrid==="binder") grid=owned.map(k=>gridTile(k,{v:me.vars[k],tag:label(me.cards[k]),over:`${money(valOf(k,me.vars[k]))} market value`,click:`openCard('${k}','${me.vars[k]||""}')`})).join("");
  else grid=sold.map(x=>gridTile(x.k,{v:x.v,price:x.price,sold:true,over:`Sold ${ago(x.t)==="now"?"just now":ago(x.t)+" ago"}`,click:`openCard('${x.k}','${x.v||""}')`})).join("");
  const empty = pGrid==="sold"&&!sold.length ? emptyBox("Nothing sold yet","Cards you mark as sold show up here.") : pGrid==="binder"&&!owned.length ? emptyBox("Your binder is empty","Add the cards you own to start.",`<button class="btn primary" onclick="openAddCard()">Add a card</button>`) : "";
  const tabs=[["sale","For sale",mine.length],["binder","Binder",owned.length],["sold","Sold",sold.length]];
  return `<section class="phead">
      <div class="ph-av">${av(me,"xxl")}</div>
      <div class="ph-main">
        <div class="ph-name"><h2>${me.name}</h2>${isPremium()?`<span class="prem-badge">${ic("spark",11)}Premium</span>`:""}<span class="tag hit">${ic("shield",12)}Verified trader</span></div>
        <div class="ph-stats"><span><b>${mine.length}</b> for sale</span><span><b>${sold.length}</b> sold</span><span><b>${me.trades}</b> trades</span><span><b>${me.rating}</b> rating</span><span><b>${followed.size}</b> following</span></div>
        <p class="ph-bio">Collector in ${me.suburb}. ${owned.length} cards in the binder, worth about ${money(Math.round(total))}. Usually at ${hs.name} on ${DOWS[hs.sched.dow]} nights.</p>
        <div class="ph-acts"><button class="btn primary" onclick="LD.k=null;openListCard(null)">${ic("tag",15)}Sell a card</button><button class="btn" onclick="go('you','binder')">Manage binder</button><button class="btn" onclick="copyProfile()">${ic("ext",15)}Share profile</button><button class="btn" onclick="openProfiles()">Switch profile</button></div>
      </div></section>
    <div class="pcols"><section class="pgrid-w">
      <div class="gtabs" role="tablist">${tabs.map(([id,l,n])=>`<button role="tab" aria-selected="${pGrid===id}" class="${pGrid===id?"on":""}" onclick="pGrid='${id}';render()">${ic(id==="sale"?"tag":id==="binder"?"grid":"check",15)}${l}<i>${n}</i></button>`).join("")}</div>
      ${empty||`<div class="pgrid">${grid}</div>`}
    </section>
    <aside class="pside">
      <section class="panel"><div class="panel-h"><h2>Plan</h2>${isPremium()?`<span class="prem-badge">${ic("spark",11)}Premium</span>`:""}</div>
        ${isPremium()?`<p class="muted" style="font-size:14px">You can see and message buyers who want the cards you're selling.</p><div class="chips-l" style="margin-top:12px"><button class="btn sm primary" onclick="go('market','leads')">Your leads</button><button class="btn sm" onclick="setPremium(false)">Switch to free (prototype)</button></div>`
          :`<p class="muted" style="font-size:14px">Free. Premium shows you who wants the cards you're selling.</p><button class="btn sm primary" style="margin-top:12px" onclick="openUpgrade()">${ic("spark",14)}Try Premium</button>`}</section>
      <section class="panel"><div class="panel-h"><h2>Your trade nights</h2>${seeAll("All","go('social','nights')")}</div>${nights.length?nights.map(n=>ticketRow(n,false)).join(""):`<p class="muted" style="font-size:14px">You haven't signed up for a trade night yet.</p>`}</section>
      <section class="panel"><div class="panel-h"><h2>Home store</h2></div><button class="lrow" onclick="openStore('${hs.id}')">${av(hs)}<div><b>${hs.name}</b><span>${hs.street}, ${hs.suburb}. ${hs.nightFull}</span></div>${ic("chev",16)}</button></section>
      <section class="panel"><div class="panel-h"><h2>Following</h2><span class="muted">${followed.size}</span></div>${USERS.filter(u=>followed.has(u.id)).map(u=>`<button class="lrow" onclick="openCollector('${u.id}')">${av(u)}<div><b>${u.name}</b><span>${u.focus}, ${u.suburb}</span></div>${ic("chev",16)}</button>`).join("")||`<p class="muted" style="font-size:14px">The Social tab ranks collectors by how well their binder fits yours.</p>`}</section>
    </aside></div>`;
}
function copyProfile(){ try{ navigator.clipboard.writeText(location.href.split("#")[0]+"#/app/you/profile"); toast("Profile link copied."); }catch(e){ toast("Couldn't copy the link in this browser."); } }
function binderPage(){
  const owned=Object.keys(me.cards), total=binderValue(), counts={own:0,trade:0,sell:0}; owned.forEach(k=>counts[me.cards[k]]++);
  let list=owned.filter(k=>bFilter==="all"||me.cards[k]===bFilter);
  const sorters={value:(a,b)=>valOf(b,me.vars[b])-valOf(a,me.vars[a]),name:(a,b)=>CARDS[a].n.localeCompare(CARDS[b].n),status:(a,b)=>me.cards[a].localeCompare(me.cards[b])};
  list.sort(sorters[bSort]);
  const th=(id,l,cls="")=>`<th class="${cls}" ${bSort===id?'aria-sort="ascending"':""}><button class="th-b${bSort===id?" on":""}" onclick="bSort='${id}';render()">${l}${bSort===id?'<i class="srt"></i>':""}</button></th>`;
  const wants=[...new Set([...me.wants])].sort((a,b)=>CARDS[b].v-CARDS[a].v);
  return `<div class="cols-bind"><section><div class="rbar"><h2>${plural(owned.length,"card")}, ${money(Math.round(total))}</h2>
      <div class="rbar-r"><div class="chips-l">${[["all","All ("+owned.length+")"],["own","Keeping ("+counts.own+")"],["trade","Will trade ("+counts.trade+")"],["sell","Selling ("+counts.sell+")"]].map(([id,l])=>`<button class="chip${bFilter===id?" on":""}" aria-pressed="${bFilter===id}" onclick="bFilter='${id}';render()">${l}</button>`).join("")}</div><button class="btn primary sm" onclick="openAddCard()">${ic("plus",15)}Add a card</button></div></div>
    <div class="tbl-wrap"><table class="tbl bind"><thead><tr>${th("name","Card")}<th>Printing</th>${th("status","Status")}${th("value","Value","num")}</tr></thead><tbody>
    ${list.map(k=>`<tr><td><button class="tcell" onclick="openCard('${k}')"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><span><b>${CARDS[k].n}</b><em>${esc(CARDS[k].s)}</em></span></button></td>
      <td><select class="mini-sel" aria-label="Printing of ${esc(CARDS[k].n)}" onchange="setVar('${k}',this.value)">${variantsFor(k).map(v=>`<option value="${v.id}"${me.vars[k]===v.id?" selected":""}>${v.label}, ${money(Math.round(CARDS[k].v*v.mult))}</option>`).join("")}</select></td>
      <td><div class="segc" role="group" aria-label="Status of ${esc(CARDS[k].n)}">${[["own","Keeping"],["trade","Will trade"],["sell","Selling"]].map(([id,l])=>`<button class="${me.cards[k]===id?"on":""}" aria-pressed="${me.cards[k]===id}" onclick="setStatus('${k}','${id}')">${l}</button>`).join("")}</div></td>
      <td class="num"><b>${money(valOf(k,me.vars[k]))}</b>${me.cards[k]==="sell"?`<button class="asklink" onclick="LD.k=null;openListCard('${k}')">Asking ${money(askOf(k))}</button>`:""}</td></tr>`).join("")}</tbody></table></div></section>
    <aside class="panel wantp"><div class="panel-h"><h2>Want list</h2><span class="muted">${wants.length}</span></div>
      ${wants.map(k=>`<div class="lrow"><span class="fw sm">${cardFace(k,{sm:true})}</span><div><b>${CARDS[k].n}</b><span>${holdersOf(k)+stockedAt(k)?plural(holdersOf(k)+stockedAt(k),"seller")+" nearby":"Nobody has it yet"}</span></div><button class="icon-btn sm" onclick="toggleWant('${k}')" aria-label="Remove ${esc(CARDS[k].n)} from want list">${ic("x",15)}</button></div>`).join("")||emptyBox("Your want list is empty","Add cards from Search.")}
      <button class="btn block" style="margin-top:12px" onclick="openAddCard()">${ic("plus",15)}Add to want list</button></aside></div>`;
}

/* =====================================================================
   Selling: your listings, the list-a-card flow, and saved binder state
   ===================================================================== */
const SKEY=pkey("binderloop.web.sell.v1");
let SELL={ask:{},noTrade:{},sold:[]};
(function initSell(){
  try{
    const s=JSON.parse(localStorage.getItem(SKEY)||"null");
    if(s&&typeof s==="object"){
      if(s.cards&&typeof s.cards==="object"){ const c={}; for(const k in s.cards) if(CARDS[k]&&["own","trade","sell"].includes(s.cards[k])) c[k]=s.cards[k]; me.cards=c; }
      if(s.vars&&typeof s.vars==="object") for(const k in s.vars) if(CARDS[k]&&variantsFor(k).some(v=>v.id===s.vars[k])) me.vars[k]=s.vars[k];
      if(Array.isArray(s.wants)) me.wants=s.wants.filter(k=>CARDS[k]);
      SELL.ask=s.ask&&typeof s.ask==="object"?s.ask:{}; SELL.noTrade=s.noTrade&&typeof s.noTrade==="object"?s.noTrade:{}; SELL.sold=Array.isArray(s.sold)?s.sold.filter(x=>x&&CARDS[x.k]):[]; if(typeof s.premium==="boolean") SELL.premium=s.premium; if(s.leads&&typeof s.leads==="object") SELL.leads=s.leads;
    }
  }catch(e){}
  Object.keys(me.cards).forEach(k=>{ if(me.cards[k]==="sell"&&!(SELL.ask[k]>0)) SELL.ask[k]=valOf(k,me.vars[k]); });
  for(const k in SELL.ask) if(me.cards[k]!=="sell") delete SELL.ask[k];
  me.noTrade=SELL.noTrade;
})();
function saveSell(){ try{ localStorage.setItem(SKEY,JSON.stringify({ask:SELL.ask,noTrade:SELL.noTrade,sold:SELL.sold,premium:SELL.premium,leads:SELL.leads,cards:me.cards,vars:me.vars,wants:me.wants})); }catch(e){} }
const myListings = ()=>Object.keys(me.cards).filter(k=>me.cards[k]==="sell").sort((a,b)=>(SELL.ask[b]||0)-(SELL.ask[a]||0));
const askOf = k=>SELL.ask[k]||valOf(k,me.vars[k]);
const buyersFor = k=>PARTIES().filter(p=>p.wants.includes(k));
const pctVs = (price,market)=>Math.round((price/market-1)*100);
const vsText = p=>p===0?"at market value":p<0?`${-p}% under market`:`${p}% over market`;
// what other people are asking for the same card and printing
function comparables(k,v){ return listings().filter(l=>l.k===k&&(l.seller.vars[k]||variantsFor(k)[0].id)===v).sort((a,b)=>a.price-b.price); }

/* ---------- list-a-card modal ---------- */
const LD={k:null,v:null,price:null,trade:true};
function openListCard(k){
  if(k&&CARDS[k]){
    const fresh=LD.k!==k; LD.k=k;
    if(fresh){ LD.v=me.vars[k]||variantsFor(k)[0].id; LD.price=me.cards[k]==="sell"?askOf(k):valOf(k,LD.v); LD.trade=!SELL.noTrade[k]; }
  } else if(k===null){ LD.k=null; }
  renderListModal();
}
function ldSet(patch){ Object.assign(LD,patch); renderListModal(); }
function ldVar(v){ const oldMarket=valOf(LD.k,LD.v), p=pctVs(LD.price,oldMarket); LD.v=v; LD.price=Math.max(1,Math.round(valOf(LD.k,v)*(1+p/100))); renderListModal(); }
function renderListModal(){
  if(!LD.k){
    if(CAT.state!=="ready"){
      if(CAT.state!=="error") catLoad(()=>{ const m=$("#modal"); if(!LD.k && m && m.classList.contains("on")) renderListModal(); });
      openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>List an item for sale</h2>
        ${CAT.state==="error"?emptyBox("Couldn't load the catalogue","The file data/catalog.js wasn't found.",`<button class="btn primary" onclick="dbRetryCatalog();renderListModal()">Try again</button>`)
          :`<div class="empty" role="status"><b>Loading the catalogue…</b><p>About 20,000 cards. This only happens the first time.</p></div>`}</div>`,{label:"List an item"});
      return;
    }
    const owned=Object.keys(me.cards).sort((a,b)=>buyersFor(b).length-buyersFor(a).length||valOf(b,me.vars[b])-valOf(a,me.vars[a]));
    openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
      <h2>List an item for sale</h2><p class="muted">Search for any card or sealed product, or pick from your binder below.</p>
      <div class="bigsearch" style="margin:14px 0">${ic("search",18)}<input id="psq" data-autofocus placeholder="Search any card or sealed product" autocomplete="off" oninput="psQuery(this.value)" aria-label="Search cards and sealed product"></div>
      <div id="ps-res" class="dbres" style="margin-bottom:6px"></div>
      ${owned.length?`<h3 class="sub">Your binder</h3><div class="pickgrid" style="margin-top:10px">${owned.map(k=>{ const on=me.cards[k]==="sell", n=buyersFor(k).length;
        return `<button class="pickc" onclick="openListCard('${k}')"><span class="fw big">${faceOf(k,me)}</span><b>${CARDS[k].n}</b><span>${on?"Listed at "+money(askOf(k)):n?plural(n,"buyer")+" looking":money(valOf(k,me.vars[k]))}</span></button>`; }).join("")}</div>`:""}
      <div class="mdl-actions left"><button class="btn" onclick="closeModal()">Cancel</button></div></div>`,{wide:true,label:"List an item"});
    return;
  }
  const k=LD.k, c=CARDS[k], market=valOf(k,LD.v), p=pctVs(LD.price,market), comps=comparables(k,LD.v), buyers=buyersFor(k), editing=me.cards[k]==="sell";
  const chip=(label,price)=>`<button class="chip${LD.price===price?" on":""}" aria-pressed="${LD.price===price}" onclick="ldSet({price:${price}})">${label}</button>`;
  const r=m=>Math.max(1,Math.round(market*m));
  const hint = comps.length ? `The cheapest ${vOf(k,LD.v).label.toLowerCase()} copy nearby is <b>${money(comps[0].price)}</b> from ${comps[0].seller.name}. ${LD.price<=comps[0].price?"You'd be the cheapest listing.":"Buyers will see theirs first when sorting by price."}`
    : `Nobody nearby is selling this printing right now, so yours would be the only one listed.`;
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button>
  <div class="mdl-card"><div><div class="tilt">${cardFace(k,{v:LD.v})}</div></div>
  <div class="mdl-info"><h2>${editing?"Edit your listing":"List "+c.n}</h2><p class="muted">${esc(c.s)}</p>
    <h3 class="sub">Printing</h3><div class="chips-l">${variantsFor(k).map(v=>`<button class="chip${LD.v===v.id?" on":""}" aria-pressed="${LD.v===v.id}" onclick="ldVar('${v.id}')">${v.label}</button>`).join("")}</div>
    <h3 class="sub">Asking price</h3>
    <div class="priceset"><span class="cur">$</span><input id="ldp" type="number" min="1" step="1" inputmode="numeric" aria-label="Asking price in dollars" value="${LD.price}" onchange="ldSet({price:Math.max(1,Math.round(+this.value||1))})"><span class="muted">${p===0?"Same as the market value":vsText(p).replace("market","the market value of "+money(market))}</span></div>
    <div class="chips-l" style="margin-top:10px">${chip("Market value",market)}${chip("5% under",r(.95))}${chip("10% under",r(.9))}${chip("5% over",r(1.05))}</div>
    <p class="note">${hint}</p>
    <button class="fsw${LD.trade?" on":""}" role="switch" aria-checked="${LD.trade}" onclick="ldSet({trade:!LD.trade})" style="margin-top:12px"><span>Also open to trade offers<em class="fsw-s">People can offer cards instead of cash</em></span><i></i></button>
    <div class="handover">${ic("tag",18)}<span>${buyers.length?`<b>${plural(buyers.length,"collector")}${buyers.some(b=>b.store)?" and stores":""} nearby</b> have this on their want list and will see your listing.`:"Your listing shows in Buy for everyone nearby, and in search results for this card."}</span></div>
    <div class="mdl-actions left"><button class="btn primary lg" data-autofocus onclick="confirmList()">${editing?"Save, "+money(LD.price):"List for "+money(LD.price)}</button>
      ${editing?`<button class="btn danger" onclick="unlist('${k}')">Take it off sale</button>`:`<button class="btn" onclick="openListCard(null)">Choose another card</button>`}</div></div></div>`,{wide:true,label:"List a card"});
}
function confirmList(){
  const k=LD.k, was=me.cards[k]==="sell";
  if(!me.cards[k]) me.cards[k]="own";
  me.vars[k]=LD.v; me.cards[k]="sell"; SELL.ask[k]=LD.price;
  if(LD.trade) delete SELL.noTrade[k]; else SELL.noTrade[k]=true;
  closeModal(); LD.k=null; render();
  const n=buyersFor(k).filter(openToSellers).filter(p=>leadState(p,k)==="new").length;
  if(!was&&n){ confirmModal(isPremium()?{title:`${CARDS[k].n} is listed for ${money(SELL.ask[k])}`,msg:`${plural(n,"buyer")} nearby ${n===1?"has":"have"} it on their want list. Send them a message now, while they're looking.`,primary:["See your leads",`leadCard='${k}';go('market','leads')`],close:"Later"}
      :{title:`${CARDS[k].n} is listed for ${money(SELL.ask[k])}`,msg:`${plural(n,"buyer")} nearby ${n===1?"wants":"want"} this card. Premium shows you who they are so you can message them.`,primary:["See who they are","closeModal();openUpgrade()"],close:"Not now"}); return; }
  toast(was?`Listing updated. ${CARDS[k].n} is now ${money(SELL.ask[k])}.`:`${CARDS[k].n} is listed for ${money(SELL.ask[k])}.`);
}
function unlist(k){ me.cards[k]="own"; delete SELL.ask[k]; delete SELL.noTrade[k]; closeModal(); LD.k=null; render(); toast(`${CARDS[k].n} is off sale. It's back in your binder as keeping.`); }
function markSold(k){
  SELL.sold.unshift({k,v:me.vars[k],price:askOf(k),t:Date.now()});
  delete me.cards[k]; delete me.vars[k]; delete SELL.ask[k]; delete SELL.noTrade[k]; render(); toast(`Marked ${CARDS[k].n} as sold for ${money(SELL.sold[0].price)}.`);
}
function toggleOpenTrade(k){ if(SELL.noTrade[k]) delete SELL.noTrade[k]; else SELL.noTrade[k]=true; render(); }

/* ---------- Sell tab ---------- */
function sellPage(){
  const mine=myListings(), total=mine.reduce((t,k)=>t+askOf(k),0), watchers=new Set(mine.flatMap(k=>buyersFor(k).map(p=>p.id))).size;
  const ready=Object.keys(me.cards).filter(k=>me.cards[k]!=="sell"&&buyersFor(k).length).sort((a,b)=>buyersFor(b).length-buyersFor(a).length||valOf(b,me.vars[b])-valOf(a,me.vars[a]));
  const soldTotal=SELL.sold.reduce((t,x)=>t+x.price,0);
  return `<div class="stats three">
      <div class="stat"><b>${mine.length}</b><span>cards for sale</span></div>
      <div class="stat"><b>${money(total)}</b><span>total asking</span></div>
      <div class="stat"><b>${watchers}</b><span>buyers with your cards on their want list</span></div></div>
    <div class="rbar"><h2>Your listings</h2><button class="btn primary" onclick="openListCard(null)">${ic("plus",16)}List an item</button></div>
    ${mine.length?`<div class="tbl-wrap"><table class="tbl sellt"><thead><tr><th>Card</th><th class="num">Asking</th><th>Compared to market</th><th>Interested</th><th>Open to trades</th><th></th></tr></thead><tbody>
      ${mine.map(k=>{ const a=askOf(k), m=valOf(k,me.vars[k]), p=pctVs(a,m), b=buyersFor(k), comp=comparables(k,me.vars[k]||variantsFor(k)[0].id)[0];
        return `<tr><td><button class="tcell" onclick="openCard('${k}')"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><span><b>${CARDS[k].n}</b><em>${vOf(k,me.vars[k]).label}, ${esc(CARDS[k].s)}</em></span></button></td>
          <td class="num"><span class="sticker sm">${money(a)}</span></td>
          <td><span class="${p>5?"warnt":p<0?"goodt":""}">${vsText(p)}</span>${comp?`<em class="sub-t">Cheapest nearby ${money(comp.price)}</em>`:`<em class="sub-t">Only one listed nearby</em>`}</td>
          <td>${b.length?`<span class="stack">${b.slice(0,3).map(u=>av(u,"xs")).join("")}</span><em class="sub-t">${b.length} want it ${leadLink(k)}</em>`:`<span class="muted">Nobody yet</span>`}</td>
          <td><button class="fsw mini${SELL.noTrade[k]?"":" on"}" role="switch" aria-checked="${!SELL.noTrade[k]}" aria-label="Open to trade offers for ${esc(CARDS[k].n)}" onclick="toggleOpenTrade('${k}')"><i></i></button></td>
          <td class="acts"><button class="btn sm" onclick="openListCard('${k}')">Edit</button><button class="btn sm" onclick="markSold('${k}')">Mark as sold</button></td></tr>`; }).join("")}</tbody></table></div>`
      :emptyBox("You're not selling anything yet","List a card or sealed product and it shows up for buyers nearby.",`<button class="btn primary" onclick="openListCard(null)">List an item</button>`)}
    ${sealedSellSection()}
    <div class="two" style="margin-top:22px">
      <section class="panel"><div class="panel-h"><h2>People want these</h2><span class="muted">Cards in your binder with buyers nearby</span></div>
        ${ready.length?ready.slice(0,6).map(k=>{ const b=buyersFor(k); return `<div class="lrow"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><div><b>${CARDS[k].n} ${vchipOf(k,me)}</b><span>${plural(b.length,"buyer")} looking, market ${money(valOf(k,me.vars[k]))}</span></div><button class="btn sm primary" onclick="openListCard('${k}')">List it</button></div>`; }).join(""):`<p class="muted">Nothing in your binder is on anyone's want list right now.</p>`}</section>
      <section class="panel"><div class="panel-h"><h2>Sold</h2><span class="muted">${SELL.sold.length?money(soldTotal)+" in total":""}</span></div>
        ${SELL.sold.length?SELL.sold.slice(0,8).map(x=>`<div class="lrow"><span class="fw sm">${cardFace(x.k,{sm:true,v:x.v})}</span><div><b>${CARDS[x.k].n}</b><span>${vOf(x.k,x.v).label}, ${ago(x.t)==="now"?"just now":ago(x.t)+" ago"}</span></div><span class="val">${money(x.price)}</span></div>`).join(""):`<p class="muted">Cards you mark as sold appear here.</p>`}</section></div>`;
}

/* =====================================================================
   Premium: lead generation for sellers
   A lead is a buyer who has one of the cards you're selling on their want list
   and has said they're happy to hear from sellers.
   ===================================================================== */
if(SELL.premium===undefined) SELL.premium=true;          // prototype starts on Premium so the feature is visible
if(!SELL.leads||typeof SELL.leads!=="object") SELL.leads={};
const isPremium = ()=>!!SELL.premium;
const callName = p=>p.store?p.name:first(p);
const openToSellers = p=>p.store || hsh(p.id+"sellers")%7!==0;   // buyers opt in to seller messages
const leadKey = (p,k)=>p.id+"|"+k;
const activeHours = p=>1+hsh(p.id+"act")%70;
const activeText = p=>{ const h=activeHours(p); return h<24?`Active ${h}h ago`:`Active ${Math.round(h/24)}d ago`; };
const wantedDays = (p,k)=>2+hsh(p.id+k+"w")%30;
function leadThread(p,k){ const r=SELL.leads[leadKey(p,k)]; return r&&r.id?thread(r.id):null; }
function leadState(p,k){
  const r=SELL.leads[leadKey(p,k)]; if(!r) return "new";
  if(r.s==="dismissed") return "dismissed";
  const o=r.id&&thread(r.id); if(!o) return "contacted";
  const s=effStatus(o);
  return s==="agreed"||s==="done"?"agreed":s==="declined"||s==="withdrawn"||s==="expired"?"closed":o.turn==="me"?"replied":"contacted";
}
const LSTATE={new:["New","hit"],contacted:["Messaged","" ],replied:["Replied","want"],agreed:["Agreed","hit"],closed:["Closed",""],dismissed:["Hidden",""]};
// one lead per buyer, covering every card of yours they're after
function allLeads(){
  const mine=myListings(), by={};
  mine.forEach(k=>buyersFor(k).filter(openToSellers).forEach(p=>{
    (by[p.id]=by[p.id]||{p,cards:[]}).cards.push(k);
  }));
  return Object.values(by).map(L=>{
    const states=L.cards.map(k=>leadState(L.p,k)), newCards=L.cards.filter((k,i)=>states[i]==="new");
    const rank=["replied","agreed","contacted","closed","dismissed","new"], top=states.slice().sort((a,b)=>rank.indexOf(a)-rank.indexOf(b))[0];
    const value=L.cards.reduce((t,k)=>t+askOf(k),0), dist=km(me,L.p);
    const hot=activeHours(L.p)<24&&dist<15;
    const score=L.cards.length*40+(hot?30:0)-dist*1.2-activeHours(L.p)*.3+(L.p.store?-10:0);
    return Object.assign(L,{states,newCards,state:newCards.length?"new":top,value,dist,hot,score});
  }).sort((a,b)=>b.score-a.score);
}
const liveLeads = ()=>allLeads().filter(L=>L.state!=="dismissed");
const newLeads = ()=>allLeads().filter(L=>L.newCards.length);
// cards in your binder that aren't listed yet but have buyers who'd take a message
function unlistedDemand(){
  return Object.keys(me.cards).filter(k=>me.cards[k]!=="sell").map(k=>({k,n:buyersFor(k).filter(openToSellers).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n);
}

/* ---------- Upgrade ---------- */
function openUpgrade(){
  const n=liveLeads().length;
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <span class="prem-badge lg">${ic("spark",15)}Premium</span>
    <h2 style="margin-top:14px">Find buyers for your cards</h2>
    <p class="muted">${n?`Right now ${plural(n,"buyer")} nearby ${n===1?"has":"have"} cards you're selling on their want list.`:"When buyers nearby want a card you're selling, you'll see who they are."} Premium shows you who they are and lets you message them directly.</p>
    <ul class="checks" style="margin-top:14px"><li>See every buyer who wants a card you're selling</li><li>Message them with your price and a place to meet</li><li>Leads ranked by how close and how active each buyer is</li><li>Get told when someone new adds one of your cards to their want list</li></ul>
    <p class="note">Pricing for Premium hasn't been set. In this prototype you can switch it on and off freely.</p>
    <div class="mdl-actions left"><button class="btn primary lg" data-autofocus onclick="setPremium(true)">Turn on Premium</button><button class="btn" onclick="closeModal()">Not now</button></div></div>`,{label:"Premium"});
}
function setPremium(v){ SELL.premium=!!v; closeModal(); render(); toast(v?"Premium is on. Your leads are in Marketplace, Leads.":"Premium is off. You're seeing the free version."); }

/* ---------- Leads tab ---------- */
let leadFilter="all", leadCard=null;
function leadsPage(){
  const all=allLeads(), live=all.filter(L=>L.state!=="dismissed"), fresh=all.filter(L=>L.newCards.length), mine=myListings(), demand=unlistedDemand();
  const hidden=all.length-live.length;
  if(!mine.length) return leadsIntro()+emptyBox("List a card to start getting leads","Leads are buyers who want a card you're selling. Once something is listed, they show up here.",`<button class="btn primary" onclick="LD.k=null;openListCard(null)">List a card</button>`)+demandPanel(demand);
  if(!isPremium()) return leadsLocked(live,demand);
  let list=live;
  if(leadCard) list=list.filter(L=>L.cards.includes(leadCard));
  if(leadFilter==="new") list=list.filter(L=>L.newCards.length);
  if(leadFilter==="talking") list=list.filter(L=>["contacted","replied","agreed"].includes(L.state)||L.states.some(s=>["contacted","replied","agreed"].includes(s)));
  const cnt=(f)=>f==="new"?fresh.length:f==="talking"?live.filter(L=>L.states.some(s=>["contacted","replied","agreed"].includes(s))).length:live.length;
  return leadsIntro()+`<section class="leadhero"><div class="lh-n"><b>${live.length}</b><span>potential ${live.length===1?"buyer":"buyers"}</span></div>
      <div class="lh-t"><h2>${fresh.length?`${plural(fresh.length,"buyer")} ${fresh.length===1?"hasn't":"haven't"} heard from you yet`:"You've reached out to everyone"}</h2>
        <p>${fresh.length?`Each of them has a card you're selling on their want list and is happy to hear from sellers. A short, friendly message with your price and a place to meet is usually all it takes.`:`New buyers appear here when someone adds one of your listed cards to their want list.`}</p>
        ${fresh.length?`<button class="btn primary" onclick="openReach('${fresh[0].p.id}')">${ic("send",16)}Message ${callName(fresh[0].p)} first</button>`:""}</div>
      <div class="lh-cards">${mine.map(k=>{ const n=live.filter(L=>L.cards.includes(k)).length; return `<button class="lh-card${leadCard===k?" on":""}" aria-pressed="${leadCard===k}" onclick="leadCard=leadCard==='${k}'?null:'${k}';render()"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><span><b>${CARDS[k].n}</b><em>${plural(n,"lead")}, ${money(askOf(k))}</em></span></button>`; }).join("")}</div></section>
    <div class="rbar"><div class="chips-l">${[["all","All leads"],["new","Not contacted"],["talking","In conversation"]].map(([id,l])=>`<button class="chip${leadFilter===id?" on":""}" aria-pressed="${leadFilter===id}" onclick="leadFilter='${id}';render()">${l} (${cnt(id)})</button>`).join("")}${leadCard?`<button class="chip on" onclick="leadCard=null;render()">${CARDS[leadCard].n}${ic("x",13)}</button>`:""}</div>
      ${hidden?`<button class="link" onclick="unhideLeads()">Show ${plural(hidden,"hidden lead")}</button>`:""}</div>
    ${list.length?`<div class="leads">${list.map(leadRow).join("")}</div>`:emptyBox("No leads match","Try another filter.")}
    ${demandPanel(demand)}
    <p class="note" style="margin-top:18px">Only buyers who've chosen to hear from sellers appear here, and you can message each buyer once per card. <button class="link" onclick="setPremium(false)">Preview the free version</button></p>`;
}
function leadsIntro(){ return `<p class="muted intro">Leads are buyers nearby who have one of your cards on their want list. ${isPremium()?"":"Premium shows you who they are so you can reach out."}</p>`; }
function leadRow(L){
  const p=L.p;
  const cardsHTML=L.cards.map((k,i)=>{ const st=L.states[i], o=leadThread(p,k), [lab,cls]=LSTATE[st];
    return `<div class="lc"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><span class="lc-b"><b>${CARDS[k].n} ${vchipOf(k,me)}</b><em>On their want list for ${wantedDays(p,k)} days. You're asking ${money(askOf(k))}.</em></span>
      <span class="tag ${cls}">${lab}</span>
      ${st==="new"?`<button class="btn sm primary" onclick="openReach('${p.id}','${k}')">Message</button>`:o?`<button class="btn sm" onclick="openThread('${o.id}')">View</button>`:""}</div>`; }).join("");
  return `<article class="lead${L.state==="new"?" isnew":""}">
    <header class="lead-h"><button class="who" onclick="${p.store?`openStore('${p.id}')`:`openCollector('${p.id}')`}">${av(p,"lg")}<span><b>${p.name}${p.store?" (store)":""}</b><span>${p.store?p.street+", ":""}${p.suburb}, ${kmTxt(L.dist)} away, rated ${p.rating}</span></span></button>
      <div class="lead-meta">${L.hot?`<span class="tag hit">${ic("spark",12)}Active and nearby</span>`:""}<span class="muted">${activeText(p)}</span></div></header>
    <div class="lead-cards">${cardsHTML}</div>
    <footer class="lead-f"><span class="muted">${L.cards.length>1?`Wants ${L.cards.length} of your cards, ${money(L.value)} together.`:`Would meet at ${bestStoreFor(p).name}, the fairest trip for you both.`}</span>
      ${L.newCards.length?`<button class="link" onclick="hideLead('${p.id}')">Not now</button>`:""}</footer></article>`;
}
function leadsLocked(live,demand){
  const n=live.length;
  return leadsIntro()+`<section class="leadhero locked"><div class="lh-n"><b>${n}</b><span>potential ${n===1?"buyer":"buyers"}</span></div>
      <div class="lh-t"><h2>${n?`${plural(n,"buyer")} nearby ${n===1?"wants":"want"} cards you're selling`:"No buyers yet"}</h2>
        <p>Upgrade to Premium to see who they are and message them with your price.</p>
        <button class="btn primary" onclick="openUpgrade()">${ic("spark",16)}See who they are</button></div></section>
    <div class="leads blurred" aria-hidden="true">${live.slice(0,4).map(L=>`<article class="lead"><header class="lead-h"><div class="who"><span class="avatar lg" style="--h:${L.p.h}">··</span><span><b>Collector in ${L.p.suburb}</b><span>${kmTxt(L.dist)} away</span></span></div></header>
      <div class="lead-cards">${L.cards.map(k=>`<div class="lc"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><span class="lc-b"><b>${CARDS[k].n}</b><em>On their want list</em></span></div>`).join("")}</div></article>`).join("")}</div>
    ${demandPanel(demand)}`;
}
function demandPanel(demand){
  if(!demand.length) return "";
  return `<section class="panel" style="margin-top:22px"><div class="panel-h"><h2>More leads if you list these</h2><span class="muted">Cards in your binder that buyers nearby want</span></div>
    ${demand.slice(0,5).map(({k,n})=>`<div class="lrow"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><div><b>${CARDS[k].n} ${vchipOf(k,me)}</b><span>${plural(n,"potential buyer")}, market value ${money(valOf(k,me.vars[k]))}</span></div><button class="btn sm primary" onclick="LD.k=null;openListCard('${k}')">List it</button></div>`).join("")}</section>`;
}
function hideLead(pid){ const L=allLeads().find(x=>x.p.id===pid); if(!L) return; L.newCards.forEach(k=>{ SELL.leads[leadKey(L.p,k)]={s:"dismissed",t:Date.now()}; }); render(); toast(`${L.p.name} is hidden from your leads.`); }
function unhideLeads(){ for(const key in SELL.leads) if(SELL.leads[key].s==="dismissed") delete SELL.leads[key]; render(); }

/* ---------- Reach out ---------- */
const RD={pid:null,k:null,price:null,loc:null,text:"",edited:false};
function openReach(pid,k){
  if(!isPremium()){ openUpgrade(); return; }
  const L=allLeads().find(x=>x.p.id===pid); if(!L) return;
  const cards=L.newCards.length?L.newCards:L.cards;
  if(RD.pid!==pid||(k&&RD.k!==k)){ RD.pid=pid; RD.k=k&&cards.includes(k)?k:cards[0]; RD.price=askOf(RD.k); RD.loc=L.p.store?L.p.id:bestStoreFor(L.p).id; RD.edited=false; }
  renderReach();
}
function reachText(){
  const p=findParty(RD.pid), k=RD.k, st=STORES.find(s=>s.id===RD.loc), n=st&&nextNights(st,1)[0];
  const hi = p.store?`Hi ${p.name} team`:`Hi ${callName(p)}`;
  return `${hi}, I saw ${CARDS[k].n} is on your want list. I've got one (${vOf(k,me.vars[k]).label}) and I'm selling it for ${money(RD.price)}.${st?` I could meet at ${st.name}${n?` on ${fmtDate(n.date)}`:""}.`:""} Let me know if you're interested!`;
}
function reachSet(patch){ Object.assign(RD,patch); if(!RD.edited) RD.text=reachText(); renderReach(); }
function renderReach(){
  const L=allLeads().find(x=>x.p.id===RD.pid); if(!L) return; const p=L.p, k=RD.k, ask=askOf(k), m=valOf(k,me.vars[k]);
  if(!RD.edited) RD.text=reachText();
  const cards=L.newCards.length?L.newCards:L.cards, r=f=>Math.max(1,Math.round(ask*f/unitFor(ask))*unitFor(ask));
  const opts=p.store?[p]:[bestStoreFor(p),...STORES.filter(s=>s!==bestStoreFor(p))];
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left">
    <div class="who">${av(p,"lg")}<div><h2 style="margin:0">Message ${p.name}</h2><span class="muted">${p.suburb}, ${kmTxt(L.dist)} away, ${activeText(p).toLowerCase()}</span></div></div>
    ${cards.length>1?`<h4 style="margin-top:18px">Which card</h4><div class="chips-l">${cards.map(c=>`<button class="chip${c===k?" on":""}" aria-pressed="${c===k}" onclick="reachSet({k:'${c}',price:askOf('${c}')})">${CARDS[c].n}</button>`).join("")}</div>`:""}
    <div class="lrow" style="margin-top:14px;background:var(--bg);padding:10px 12px"><span class="fw sm">${faceOf(k,me,{sm:true})}</span><div><b>${CARDS[k].n} ${vchipOf(k,me)}</b><span>Your asking price ${money(ask)}, market value ${money(m)}</span></div></div>
    <h4 style="margin-top:18px">Price to offer them</h4>
    <div class="chips-l">${[["Asking price",ask],["5% off",r(.95)],["10% off",r(.9)]].map(([l,v])=>`<button class="chip${RD.price===v?" on":""}" aria-pressed="${RD.price===v}" onclick="reachSet({price:${v}})">${l}, ${money(v)}</button>`).join("")}</div>
    <h4 style="margin-top:18px">Where to meet</h4>
    <div class="chips-l">${opts.map(s=>`<button class="chip${RD.loc===s.id?" on":""}" aria-pressed="${RD.loc===s.id}" onclick="reachSet({loc:'${s.id}'})">${s.name}</button>`).join("")}</div>
    <label class="field" style="margin-top:18px">Your message<textarea id="rtxt" rows="4" oninput="RD.text=this.value;RD.edited=true">${esc(RD.text)}</textarea></label>
    ${RD.edited?`<button class="link" style="margin-top:6px" onclick="RD.edited=false;renderReach()">Reset to the suggested message</button>`:""}
    <p class="note">${callName(p)} gets one message from you about this card. If they don't reply within 48 hours, the offer expires and you can't message them about it again.</p>
    <div class="mdl-actions left"><button class="btn primary lg" data-autofocus onclick="sendReach()">${ic("send",16)}Send to ${callName(p)}</button><button class="btn" onclick="closeModal()">Cancel</button></div></div>`,{label:"Message a buyer"});
}
function sendReach(){
  const p=findParty(RD.pid), k=RD.k, text=(RD.text||"").trim()||reachText();
  if(!p||!k||leadState(p,k)!=="new"){ closeModal(); return; }
  const o=makeThread({type:"sell",party:p.id,give:[k],get:[],cash:RD.price,asking:askOf(k),loc:RD.loc,lead:true,text});
  SELL.leads[leadKey(p,k)]={s:"contacted",id:o.id,t:Date.now()};
  RD.pid=null; render();
  confirmModal({title:`Sent to ${callName(p)}`,msg:`${callName(p)} can accept, counter or decline. You'll see their reply in Messages.`,primary:["Open the conversation",`openThread('${o.id}')`],close:"Back to leads"});
}
function completeSale(id){
  const o=thread(id); if(!o) return; const k=o.give[0];
  markDone(id);
  if(me.cards[k]){ SELL.ask[k]=o.cash; markSold(k); }
}

/* ---------- nudges used elsewhere ---------- */
function leadBanner(){
  const live=liveLeads(), fresh=newLeads();
  if(!myListings().length||!live.length) return "";
  if(!isPremium()) return `<div class="lbanner locked">${ic("spark",20)}<div><b>${plural(live.length,"buyer")} nearby ${live.length===1?"wants":"want"} cards you're selling</b><span>Upgrade to Premium to see who they are and message them.</span></div><button class="btn primary" onclick="openUpgrade()">See who</button></div>`;
  if(!fresh.length) return "";
  const nm=fresh.slice(0,2).map(L=>callName(L.p)), names=fresh.length>2?`${nm.join(", ")} and ${plural(fresh.length-2,"other")}`:nm.join(" and ");
  return `<div class="lbanner">${ic("spark",20)}<div><b>You have ${plural(fresh.length,"potential buyer")}</b><span>${names} ${fresh.length===1?"has":"have"} cards you're selling on their want list. Reach out while they're looking.</span></div><button class="btn primary" onclick="go('market','leads')">See leads</button></div>`;
}
function leadLink(k){
  const n=buyersFor(k).filter(openToSellers).filter(p=>leadState(p,k)==="new").length;
  if(!n) return "";
  return isPremium()?`<button class="link" onclick="leadCard='${k}';go('market','leads')">Reach out</button>`:`<button class="link" onclick="openUpgrade()">${ic("spark",12)}See who</button>`;
}

/* =====================================================================
   Landing page + startup
   ===================================================================== */
function openPartner(){
  openModal(`<button class="x" onclick="closeModal()" aria-label="Close">${ic("x")}</button><div class="mdl-c" style="text-align:left"><h2>Become a partner store</h2>
    <p class="muted">Tell us about your store and we'll be in touch when partner applications open.</p>
    <label class="field">Your name<input data-autofocus id="pn" autocomplete="name"></label><label class="field">Store name<input id="ps" autocomplete="organization"></label><label class="field">Email<input id="pe" type="email" autocomplete="email"></label>
    <label class="field">Which night could you host?<input id="pd" placeholder="For example, Thursday evening"></label>
    <div class="mdl-actions left"><button class="btn primary" onclick="submitPartner()">Send</button><button class="btn" onclick="closeModal()">Cancel</button></div></div>`,{label:"Become a partner"});
}
function submitPartner(){ confirmModal({title:"Thanks, that's noted",msg:"This is a prototype, so nothing was actually sent. When Binder Loop opens to stores, this is where applications would arrive.",close:"Close"}); }

function landing(){
  const items=tradeItems(), topIdx=items.findIndex(it=>it.kind==="swap"&&!it.m.user.store), top=topIdx>=0?items[topIdx]:items[0], topI=topIdx>=0?topIdx:0;
  const nights=STORES.map(st=>nextNights(st,1)[0]).filter(Boolean), owned=ownedSorted();
  const aisha=OFFERS.find(o=>o.party==="aisha");
  const heroL=listings().filter(l=>!l.seller.store&&l.diff<0&&isHolo(l.k)).sort((a,b)=>b.price-a.price)[0]||listings()[0];
  const grid=listings().slice().sort((a,b)=>a.diff-b.diff).filter((l,i,arr)=>arr.findIndex(x=>x.k===l.k)===i).slice(0,6);
  const myK=myListings()[0]||ownedSorted()[0], myBuyers=myK?buyersFor(myK):[];
  const chase=["lugia","g1_6","umb","gengar","ray"];
  const ptable=[["g1_6","Charizard, Base Set"],["umb","Umbreon VMAX, alt art"]].map(([k,l])=>`<table class="ptable" style="margin-bottom:${k==="g1_6"?"18px":"0"}"><thead><tr><th colspan="2">${l}</th></tr></thead><tbody>${variantsFor(k).map(v=>`<tr><td>${v.label}</td><td class="num">${money(valOf(k,v.id))}</td></tr>`).join("")}</tbody></table>`).join("");
  return `<div class="lp">
  <header class="lp-nav"><div class="lp-nav-in"><a class="brand" href="#/">${LOGO}<span>Binder Loop</span></a>
    <nav class="lp-links" aria-label="Site"><a href="#how" onclick="event.preventDefault();goLanding('how')">How it works</a><a href="#features" onclick="event.preventDefault();goLanding('features')">Buying and selling</a><a href="#nights" onclick="event.preventDefault();goLanding('nights')">Trade nights</a><a href="#stores" onclick="event.preventDefault();goLanding('stores')">For stores</a><a href="#faq" onclick="event.preventDefault();goLanding('faq')">Questions</a></nav>
    <div class="lp-nav-r"><button class="btn login" onclick="openProfiles()">${av(me,"xs")}Log in</button><button class="btn primary" onclick="go('home')">Open the demo</button></div></div></header>

  <section class="hero"><div class="hero-in">
    <div><h1>The local marketplace for Pokémon cards.</h1>
      <p class="hero-p2">Buy from collectors and card stores near you, list your own cards in a minute, and trade instead when a swap suits you both. Every card is priced in Australian dollars.</p>
      <div class="hero-cta"><button class="btn primary lg" onclick="go('market','listings')">Browse cards for sale</button><button class="btn lg" onclick="go('market','selling');LD.k=null;openListCard(null)">Sell a card</button></div>
      <p class="hero-note">A working prototype. The collectors are fictional, and card prices are live TCGplayer market data.</p></div>
    <div class="fan" aria-label="A fan of holographic cards">${chase.map(k=>`<div class="fc"><div class="tilt">${cardFace(k)}</div></div>`).join("")}
      ${heroL?`<button class="float-m fl" onclick="go('market','listings');openListing('${heroL.id}')" aria-label="Open this listing"><span class="fw">${faceOf(heroL.k,heroL.seller)}</span><span class="fl-b"><b>${CARDS[heroL.k].n}</b><span>${heroL.seller.name}, ${heroL.seller.suburb}</span><span class="fl-p"><span class="sticker">${money(heroL.price)}</span><span class="tag hit">${-heroL.diff}% under market</span></span></span></button>`:""}
      ${nights[0]?`<div class="float-t"><span class="tk-date"><b>${nights[0].date.getDate()}</b><span>${DOWS[nights[0].date.getDay()]}</span></span><span class="tk-b"><b>${nights[0].st.name}</b><span class="tk-s">${timeRange(nights[0].st.sched)}, trade night</span></span></div>`:""}</div>
  </div></section>

  <section class="lp-sec" id="how"><h2 class="lp-h">Buy, sell or swap, then meet at a local store.</h2><p class="lp-lede">Every sale and trade is handed over at a partner store, where staff check the card before any money or cards change hands.</p>
    <div class="steps">
      <div class="step"><div class="step-n">1</div><h3>Find a card, or list one</h3><p>Browse what collectors and stores nearby are selling, or list your own with a price. Market value sits next to every asking price.</p>
        <div class="step-v">${grid.slice(0,2).map(l=>`<div class="lrow"><span class="fw sm">${faceOf(l.k,l.seller,{sm:true})}</span><div><b>${CARDS[l.k].n}</b><span>${l.seller.name}, ${diffText(l.diff)}</span></div><span class="sticker sm">${money(l.price)}</span></div>`).join("")}</div></div>
      <div class="step"><div class="step-n">2</div><h3>Agree on a price</h3><p>Buy at the asking price or make an offer. Sellers accept, counter or decline, and it all stays in one conversation.</p>
        <div class="step-v">${(()=>{ const l=grid[1]||grid[0]; if(!l) return ""; const u=unitFor(l.price), off=Math.max(1,Math.round(l.price*.88/u)*u), mid=Math.max(off,Math.round((off+l.price)/2/u)*u);
          return `<div style="display:flex;flex-direction:column;gap:8px"><div class="bub me">Would you take ${money(off)} for the ${esc(CARDS[l.k].n)}?</div><div class="bub them">Meet me at ${money(mid)} and it's yours. I'm at ${esc(STORES.find(s=>s.id===homeStore).name)} on Thursday.</div><div class="sysmsg" style="margin:2px 0 0">Offer accepted at ${money(mid)}</div></div>`; })()}</div></div>
      <div class="step"><div class="step-n">3</div><h3>Hand over at a store</h3><p>Meet at a partner store, often on its weekly trade night. Staff check the card is exactly as listed before anyone pays.</p>
        <div class="step-v">${nights[0]?ticketRow(nights[0],false):""}</div></div>
    </div></section>

  <div class="lp-band" id="features"><section class="lp-sec">
    <h2 class="lp-h">Everything you need to buy and sell cards locally.</h2><p class="lp-lede">Fair prices, the right printing and a safe place to meet. Trading is built in for when a swap works better than cash.</p>
    <div class="feat"><div class="feat-t"><h3>Buy from people nearby</h3><p>Browse cards listed by local collectors and partner stores. Filter to your want list, see how each price compares to the market, and buy outright or make an offer.</p>
      <ul><li>Listings from collectors and card stores</li><li>Every asking price shown against market value</li><li>Pay at the handover, once you've seen the card</li></ul></div>
      <div class="feat-v"><div class="tiles" style="grid-template-columns:repeat(3,1fr)">${grid.slice(0,3).map(l=>`<button class="tile" onclick="openListing('${l.id}')"><span class="tile-art tilt">${faceOf(l.k,l.seller)}<span class="sticker">${money(l.price)}</span></span><span class="tile-b"><b>${CARDS[l.k].n}</b><span class="tile-s">${l.seller.name}, ${l.seller.suburb}</span><span class="tile-t">${vchipOf(l.k,l.seller)}${holoChip(l.k)}</span></span></button>`).join("")}</div></div></div>
    <div class="feat rev"><div class="feat-t"><h3>Sell in a minute</h3><p>Pick a card from your binder, choose the printing and set a price. You'll see its market value and the cheapest similar listing nearby, so you can price it to sell.</p>
      <ul><li>Suggested prices from live market data</li><li>Collectors with the card on their want list see it</li><li>Take trade offers too, if you want</li></ul></div>
      <div class="feat-v">${myK?`<div class="lrow"><span class="fw" style="width:78px">${faceOf(myK,me)}</span><div><b style="font-family:var(--display);font-size:19px">${CARDS[myK].n}</b><span>${vOf(myK,me.vars[myK]).label}, market value ${money(valOf(myK,me.vars[myK]))}</span><span style="margin-top:10px;display:block"><span class="sticker">${money(askOf(myK))}</span></span></div></div>
        <div class="handover">${ic("tag",18)}<span>${myBuyers.length?`<b>${plural(myBuyers.length,"buyer")} nearby</b> ${myBuyers.length===1?"has":"have"} this on their want list.`:"Listed for everyone nearby to see."}</span></div>`:""}</div></div>
    <div class="feat"><div class="feat-t"><h3>Every printing priced separately</h3><p>A Shadowless or 1st Edition print isn't worth the same as an Unlimited one, and a PSA 10 isn't a raw card. Every listing names its printing, so buyers know exactly what they're paying for.</p>
      <ul><li>Unlimited, Shadowless and 1st Edition for vintage cards</li><li>Raw, PSA 9 and PSA 10 for modern chase cards</li><li>Prices from TCGplayer's near-mint market</li></ul></div>
      <div class="feat-v">${ptable}</div></div>
    <div class="feat rev"><div class="feat-t"><h3>Or trade instead</h3><p>Sometimes a swap beats paying. When a collector has a card you want and wants one of yours, we suggest the trade and work out the cash to balance it.</p>
      <ul><li>Swaps with collectors, and trade-ins at stores</li><li>A cash top-up when values don't match</li><li>Three-way trades when nobody lines up directly</li></ul></div>
      <div class="feat-v">${top?tradeRow(top,topI,false):""}</div></div>
    <div class="feat"><div class="feat-t"><h3>Every offer in one place</h3><p>Counter offers, questions about condition and last-minute changes all live in one inbox. Each conversation shows the current terms and what's waiting on whom.</p>
      <ul><li>Accept, counter or decline with the cards laid out</li><li>Offers expire after 48 hours so nothing lingers</li><li>Agreed trades drop straight into your trade night plan</li></ul></div>
      <div class="feat-v">${aisha?`<div class="chat-h" style="padding:0 0 12px;border:0">${av(partyOf(aisha))}<div><b>${partyOf(aisha).name}</b><span>${summaryLine(aisha)}</span></div>${statusPill(aisha)}</div>
        <div style="display:flex;flex-direction:column;gap:8px">${aisha.messages.filter(m=>m.from!=="sys").slice(-3).map(m=>`<div class="bub ${m.from==="me"?"me":"them"}">${esc(m.text)}</div>`).join("")}</div>`:""}</div></div>
  </section></div>

  <section class="lp-sec" id="nights"><h2 class="lp-h">A trade night every week, at stores near you.</h2><p class="lp-lede">Partner stores set aside tables and time for handovers. Pick a night, log what you're bringing and what you're after, and see who else is coming.</p>
    <div class="tix">${nights.map(n=>{ const cnt=attendees(n.key).length; return `<button class="ticket" onclick="openNight('${n.key}')"><span class="tk-date"><b>${n.date.getDate()}</b><span>${DOWS[n.date.getDay()]}</span></span><span class="tk-b"><b>${n.st.name}</b><span class="tk-s">${n.st.nightFull}</span><span class="tk-s">${n.st.street}, ${n.st.suburb}</span><span class="tk-t"><span class="tag">${cnt} going</span><span class="tag hit">${n.st.services[0]}</span></span></span></button>`; }).join("")}</div></section>

  <div class="lp-stores" id="stores"><section class="lp-sec"><div><h2 class="lp-h">Made for local card stores.</h2><p class="lp-lede">List your stock for collectors nearby and become the place they meet to hand over cards. Every sale and swap brings someone through your door.</p>
      <button class="btn primary lg" onclick="openPartner()">Become a partner store</button></div>
    <div class="store-pts"><div class="store-pt"><b>Sell your stock to local buyers</b><p>Your singles show up alongside collectors' listings, and buyers see how your price compares to the market.</p></div>
      <div class="store-pt"><b>A guest list for every night</b><p>See who's coming and which cards they're bringing and looking for.</p>${pill("Store dashboard planned")}</div>
      <div class="store-pt"><b>Cards checked at the counter</b><p>Staff confirm the exact printing on both sides before anyone walks away. That's what makes strangers comfortable swapping.</p></div>
</div></section></div>

  <section class="lp-sec" id="faq"><h2 class="lp-h">Questions people ask.</h2>
    <div class="faq">
      <details><summary>How does selling work?</summary><p>Choose a card from your binder, pick its printing and set an asking price. Buyers nearby can buy it at that price or make an offer, and you can accept, counter or decline. You meet at a partner store, and the buyer pays once they've seen the card.</p></details>
      <details><summary>Can I trade instead of paying?</summary><p>Yes. Mark any card as open to trades, and Binder Loop looks for collectors whose cards are on your want list and who want one of yours. When values differ it suggests a cash top-up, and when nobody lines up directly it looks for three-way trades.</p></details>
      <details><summary>How are cards valued?</summary><p>Each card uses the TCGplayer near-mint market price, converted to Australian dollars at 1 USD to 1.43 AUD. Shadowless, 1st Edition and graded values use estimated multipliers on that price.</p></details>
      <details><summary>Where do handovers happen?</summary><p>At a partner store, often on one of its trade nights. Staff check the card against the listing, including the printing, before anyone pays or leaves. If nobody can get to a store, cards can go through a checker by post.</p></details>
      <details><summary>What does it cost?</summary><p>This is a working prototype, so fees haven't been set and nothing is charged. The collectors, listings and conversations you see are sample data.</p></details>
      <details><summary>Is this connected to The Pokémon Company?</summary><p>No. Binder Loop is an independent project. Card names and artwork belong to their owners.</p></details>
    </div>
    <div class="hero-cta" style="margin-top:36px"><button class="btn primary lg" onclick="go('market','listings')">Browse cards for sale</button><button class="btn lg" onclick="go('home')">Open the demo</button></div></section>

  <footer class="lp-foot"><div class="lp-foot-in"><div><a class="brand" href="#/">${LOGO}<span>Binder Loop</span></a><p>Buy, sell and trade Pokémon cards with collectors near you.</p></div>
    <p>Binder Loop is an independent prototype and isn't affiliated with or endorsed by The Pokémon Company. Card names and artwork belong to their owners. Prices come from TCGplayer market data via TCG Price Lookup and are converted at 1 USD to 1.43 AUD. Collectors, stores and conversations are fictional sample data.</p></div></footer>
  </div>`;
}


