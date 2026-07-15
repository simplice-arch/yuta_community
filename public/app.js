/* YUTA BLOX COMMUNITY — app.js */

const FRUIT_META = {
  "Rocket":   { rarity:"common",    emoji:"🚀" },
  "Spin":     { rarity:"common",    emoji:"🌀" },
  "Chop":     { rarity:"common",    emoji:"🪓" },
  "Spring":   { rarity:"common",    emoji:"🌿" },
  "Kilo":     { rarity:"common",    emoji:"⚖️"  },
  "Bomb":     { rarity:"uncommon",  emoji:"💣" },
  "Smoke":    { rarity:"uncommon",  emoji:"💨" },
  "Spike":    { rarity:"uncommon",  emoji:"🌵" },
  "Blade":    { rarity:"uncommon",  emoji:"⚔️"  },
  "Flame":    { rarity:"rare",      emoji:"🔥" },
  "Falcon":   { rarity:"rare",      emoji:"🦅" },
  "Ice":      { rarity:"rare",      emoji:"🧊" },
  "Sand":     { rarity:"rare",      emoji:"⌛" },
  "Dark":     { rarity:"rare",      emoji:"🌑" },
  "Eagle":    { rarity:"rare",      emoji:"🦅" },
  "Diamond":  { rarity:"rare",      emoji:"💎" },
  "Light":    { rarity:"legendary", emoji:"✨" },
  "Love":     { rarity:"legendary", emoji:"💗" },
  "Rubber":   { rarity:"rare",      emoji:"🟡" },
  "Barrier":  { rarity:"rare",      emoji:"🛡️" },
  "Magma":    { rarity:"legendary", emoji:"🌋" },
  "Ghost":    { rarity:"legendary", emoji:"👻" },
  "Quake":    { rarity:"legendary", emoji:"🌊" },
  "Buddha":   { rarity:"legendary", emoji:"☯️" },
  "Portal":   { rarity:"legendary", emoji:"🌀" },
  "Creation": { rarity:"legendary", emoji:"🎁" },
  "Spider":   { rarity:"legendary", emoji:"🕷️" },
  "Sound":    { rarity:"legendary", emoji:"🎵" },
  "Shadow":   { rarity:"legendary", emoji:"🌑" },
  "Phoenix":  { rarity:"mythical",  emoji:"🦅" },
  "Rumble":   { rarity:"mythical",  emoji:"⚡" },
  "Lightning":{ rarity:"mythical",  emoji:"⚡" },
  "Tiger":    { rarity:"mythical",  emoji:"🐯" },
  "Yeti":     { rarity:"mythical",  emoji:"❄️" },
  "Paw":      { rarity:"mythical",  emoji:"🐾" },
  "Pain":     { rarity:"mythical",  emoji:"💀" },
  "Blizzard": { rarity:"mythical",  emoji:"❄️" },
  "Gravity":  { rarity:"mythical",  emoji:"🪐" },
  "Mammoth":  { rarity:"mythical",  emoji:"🦣" },
  "Dough":    { rarity:"mythical",  emoji:"🍩" },
  "Venom":    { rarity:"mythical",  emoji:"🐍" },
  "Gas":      { rarity:"mythical",  emoji:"💨" },
  "Control":  { rarity:"mythical",  emoji:"🎮" },
  "Dragon":   { rarity:"mythical",  emoji:"🐉" },
  "Spirit":   { rarity:"mythical",  emoji:"👻" },
  "Kitsune":  { rarity:"mythical",  emoji:"🦊" },
  "Leopard":  { rarity:"mythical",  emoji:"🐆" },
  "T-Rex":    { rarity:"mythical",  emoji:"🦖" },
};

const FALLBACK_STOCK = {
  normal: [
    {name:"Rocket", beli:5000,    type:"Natural",   rarity:"common",    img:null},
    {name:"Spin",   beli:7500,    type:"Natural",   rarity:"common",    img:null},
    {name:"Blade",  beli:30000,   type:"Natural",   rarity:"uncommon",  img:null},
    {name:"Eagle",  beli:550000,  type:"Beast",     rarity:"rare",      img:null},
    {name:"Light",  beli:650000,  type:"Elemental", rarity:"legendary", img:null},
    {name:"Creation",beli:1400000,type:"Natural",   rarity:"legendary", img:null},
  ],
  mirage: [
    {name:"Rocket", beli:5000,    type:"Natural",   rarity:"common",    img:null},
    {name:"Spin",   beli:7500,    type:"Natural",   rarity:"common",    img:null},
    {name:"Blade",  beli:30000,   type:"Natural",   rarity:"uncommon",  img:null},
    {name:"Spring", beli:60000,   type:"Natural",   rarity:"common",    img:null},
    {name:"Flame",  beli:250000,  type:"Elemental", rarity:"rare",      img:null},
    {name:"Ghost",  beli:940000,  type:"Natural",   rarity:"legendary", img:null},
    {name:"Phoenix",beli:1800000, type:"Beast",     rarity:"mythical",  img:null},
  ],
};

let currentTab    = "normal";
let stockData     = { normal: [], mirage: [] };
let lastFetchedAt = null;
const CACHE_TTL   = 3 * 60 * 1000;

function fmtPrice(p) {
  if (!p || p === 0) return "?";
  if (p >= 1_000_000) return (p/1_000_000).toFixed(1).replace(".0","") + "M Beli";
  if (p >= 1_000)     return Math.round(p/1_000) + "K Beli";
  return p + " Beli";
}

function rarityClass(r) {
  return {mythical:"r-mythical",legendary:"r-legendary",rare:"r-rare",uncommon:"r-uncommon",common:"r-common"}[r] || "r-common";
}

function getMeta(name) { return FRUIT_META[name] || {rarity:"common", emoji:"🍑"}; }

function buildCard(fruit, delay=0) {
  const meta   = getMeta(fruit.name);
  const rarity = fruit.rarity || meta.rarity;
  const emoji  = meta.emoji;
  const imgUrl = fruit.img;

  const imgHtml = imgUrl
    ? `<img class="fruit-img" src="${imgUrl}" alt="${fruit.name}"
         loading="lazy"
         onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
       <span class="fruit-emoji-big" style="display:none">${emoji}</span>`
    : `<span class="fruit-emoji-big">${emoji}</span>`;

  return `
  <div class="fruit-card in-stock" style="animation-delay:${delay}s">
    <div class="stock-dot in"></div>
    <div class="fruit-img-wrap">${imgHtml}</div>
    <div class="fruit-name">${fruit.name}</div>
    <span class="rarity-badge ${rarityClass(rarity)}">${rarity}</span>
    <div class="type-tag">${fruit.type || ""}</div>
    <div class="fruit-price">🪙 ${fmtPrice(fruit.beli)}</div>
  </div>`;
}

function renderStock() {
  const fruits    = stockData[currentTab] || [];
  const container = document.getElementById("stock-container");

  if (!fruits.length) {
    container.innerHTML = `<div class="loading-overlay"><div class="loading-text">Aucun fruit trouvé.</div></div>`;
    return;
  }

  const maxPrice = fruits.reduce((m,f) => Math.max(m, f.beli||0), 0);
  const maxFruit = fruits.find(f => f.beli === maxPrice);

  // Compteurs animés
  animateCount(document.getElementById("s-instock"), fruits.length);
  document.getElementById("s-total").textContent     = Object.keys(FRUIT_META).length;
  document.getElementById("s-expensive").textContent = maxFruit ? fmtPrice(maxPrice) : "—";

  const label = currentTab === "mirage" ? "Stock Mirage" : "Stock Normal";
  container.innerHTML = `
    <div class="section-header">
      <span class="section-title" style="color:var(--red)">${label}</span>
      <span class="section-badge">${fruits.length} fruits</span>
      <div class="section-line"></div>
    </div>
    <div class="fruit-grid">${fruits.map((f,i) => buildCard(f, i*0.06)).join("")}</div>`;
}

async function loadStock(force=false) {
  const btn   = document.getElementById("btn-refresh");
  const errEl = document.getElementById("error-msg");
  if (btn)   btn.classList.add("spinning");
  if (errEl) errEl.style.display = "none";

  if (!force && lastFetchedAt && Date.now()-lastFetchedAt < CACHE_TTL) {
    renderStock();
    if (btn) btn.classList.remove("spinning");
    return;
  }

  document.getElementById("stock-container").innerHTML = `
    <div class="loading-overlay">
      <div class="spinner-ring"></div>
      <div class="loading-text">Récupération du stock live...</div>
    </div>`;

  try {
    const res  = await fetch("/api/stock");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data.normal) throw new Error("Format inattendu");

    stockData     = data;
    lastFetchedAt = Date.now();
    document.getElementById("s-source").textContent     = "LIVE";
    document.getElementById("last-updated").textContent = "Mise à jour : " + new Date().toLocaleTimeString("fr-FR");
    renderStock();
  } catch(err) {
    console.error("[Stock] Erreur:", err);
    if (errEl) { errEl.style.display="block"; errEl.textContent="⚠️ Stock live indisponible. Affichage du cache."; }
    if (!stockData.normal.length) {
      stockData     = FALLBACK_STOCK;
      lastFetchedAt = Date.now();
      document.getElementById("s-source").textContent     = "CACHE";
      document.getElementById("last-updated").textContent = "Cache : " + new Date().toLocaleTimeString("fr-FR");
    }
    renderStock();
  }
  if (btn) btn.classList.remove("spinning");
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById("tab-normal").className = "tab"+(tab==="normal"?" active":"");
  document.getElementById("tab-mirage").className = "tab"+(tab==="mirage"?" active":"");
  updateTimer();
  renderStock();
}

function updateTimer() {
  const slotMs = currentTab==="mirage" ? 2*3_600_000 : 4*3_600_000;
  const now    = Date.now();
  const next   = Math.ceil(now/slotMs)*slotMs;
  const diff   = next - now;
  const h = Math.floor(diff/3_600_000);
  const m = Math.floor((diff%3_600_000)/60_000);
  const s = Math.floor((diff%60_000)/1_000);
  const urgent = diff < 10*60_000;
  ["t-h","t-m","t-s"].forEach(id => {
    document.getElementById(id).classList.toggle("urgent", urgent);
  });
  document.getElementById("t-h").textContent = String(h).padStart(2,"0");
  document.getElementById("t-m").textContent = String(m).padStart(2,"0");
  document.getElementById("t-s").textContent = String(s).padStart(2,"0");
  const nd = new Date(next);
  document.getElementById("next-time").textContent =
    String(nd.getUTCHours()).padStart(2,"0")+":"+String(nd.getUTCMinutes()).padStart(2,"0")+" UTC";
}

async function askAI() {
  const inp  = document.getElementById("ai-input");
  const resp = document.getElementById("ai-resp");
  const btn  = document.getElementById("btn-ask");
  const q    = inp.value.trim();
  if (!q) return;
  btn.disabled = true;
  resp.innerHTML = '<span class="ai-thinking">Réflexion...</span><span class="ai-cursor"></span>';
  try {
    const res = await fetch("/api/ask", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        question:    q,
        normalStock: stockData.normal.map(f=>f.name).join(", ") || "aucun",
        mirageStock: stockData.mirage.map(f=>f.name).join(", ") || "aucun",
      }),
    });
    const data = await res.json();
    resp.textContent = data.answer || "Pas de réponse.";
  } catch {
    resp.innerHTML = '<span class="ai-thinking">Erreur de connexion.</span>';
  }
  btn.disabled = false;
}

function animateCount(el, target) {
  if (!el) return;
  const duration = 500;
  const start    = performance.now();
  function update(now) {
    const t = Math.min((now-start)/duration, 1);
    el.textContent = Math.round(target * (1-Math.pow(1-t,3)));
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function createParticles() {
  const c = document.getElementById("particles");
  if (!c) return;
  for (let i=0; i<18; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random()*3+1;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;bottom:${Math.random()*-20}%;opacity:${Math.random()*.5+.1};animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*8}s;`;
    c.appendChild(p);
  }
}

document.getElementById("ai-input")?.addEventListener("keydown", e => { if(e.key==="Enter") askAI(); });

// Tabs mirage/normal
const tabNormal = document.getElementById("tab-normal");
const tabMirage = document.getElementById("tab-mirage");
if (tabNormal) tabNormal.onclick = () => switchTab("normal");
if (tabMirage) tabMirage.onclick = () => switchTab("mirage");

setInterval(updateTimer, 1000);
updateTimer();
createParticles();
loadStock();
setInterval(() => loadStock(true), 3*60*1000);
