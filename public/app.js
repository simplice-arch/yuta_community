/* ─────────────────────────────────────────────
   YUTA BLOX COMMUNITY — app.js
   ───────────────────────────────────────────── */

// Icônes depuis fruityblox (même CDN qu'ils utilisent sur leur site)
// Format : /fruits/NomFruit.png → hébergé dans notre propre dossier public
// Si l'image n'existe pas → emoji fallback
const FRUIT_META = {
  "Rocket":   { rarity: "common",    emoji: "🚀" },
  "Spin":     { rarity: "common",    emoji: "🌀" },
  "Chop":     { rarity: "common",    emoji: "🪓" },
  "Spring":   { rarity: "common",    emoji: "🌿" },
  "Kilo":     { rarity: "common",    emoji: "⚖️" },
  "Bomb":     { rarity: "uncommon",  emoji: "💣" },
  "Smoke":    { rarity: "uncommon",  emoji: "💨" },
  "Spike":    { rarity: "uncommon",  emoji: "🌵" },
  "Blade":    { rarity: "uncommon",  emoji: "⚔️" },
  "Flame":    { rarity: "rare",      emoji: "🔥" },
  "Falcon":   { rarity: "rare",      emoji: "🦅" },
  "Ice":      { rarity: "rare",      emoji: "🧊" },
  "Sand":     { rarity: "rare",      emoji: "⌛" },
  "Dark":     { rarity: "rare",      emoji: "🌑" },
  "Eagle":    { rarity: "rare",      emoji: "🦅" },
  "Diamond":  { rarity: "rare",      emoji: "💎" },
  "Light":    { rarity: "legendary", emoji: "✨" },
  "Love":     { rarity: "legendary", emoji: "💗" },
  "Rubber":   { rarity: "rare",      emoji: "🟡" },
  "Barrier":  { rarity: "rare",      emoji: "🛡️" },
  "Magma":    { rarity: "legendary", emoji: "🌋" },
  "Ghost":    { rarity: "legendary", emoji: "👻" },
  "Quake":    { rarity: "legendary", emoji: "🌊" },
  "Buddha":   { rarity: "legendary", emoji: "☯️" },
  "Portal":   { rarity: "legendary", emoji: "🌀" },
  "Creation": { rarity: "legendary", emoji: "🎁" },
  "Spider":   { rarity: "legendary", emoji: "🕷️" },
  "Sound":    { rarity: "legendary", emoji: "🎵" },
  "Shadow":   { rarity: "legendary", emoji: "🌑" },
  "Love":     { rarity: "legendary", emoji: "💗" },
  "Phoenix":  { rarity: "mythical",  emoji: "🦅" },
  "Rumble":   { rarity: "mythical",  emoji: "⚡" },
  "Lightning":{ rarity: "mythical",  emoji: "⚡" },
  "Tiger":    { rarity: "mythical",  emoji: "🐯" },
  "Yeti":     { rarity: "mythical",  emoji: "❄️" },
  "Paw":      { rarity: "mythical",  emoji: "🐾" },
  "Pain":     { rarity: "mythical",  emoji: "💀" },
  "Blizzard": { rarity: "mythical",  emoji: "❄️" },
  "Gravity":  { rarity: "mythical",  emoji: "🪐" },
  "Mammoth":  { rarity: "mythical",  emoji: "🦣" },
  "Dough":    { rarity: "mythical",  emoji: "🍩" },
  "Venom":    { rarity: "mythical",  emoji: "🐍" },
  "Gas":      { rarity: "mythical",  emoji: "💨" },
  "Control":  { rarity: "mythical",  emoji: "🎮" },
  "Dragon":   { rarity: "mythical",  emoji: "🐉" },
  "Spirit":   { rarity: "mythical",  emoji: "👻" },
  "Kitsune":  { rarity: "mythical",  emoji: "🦊" },
  "Leopard":  { rarity: "mythical",  emoji: "🐆" },
  "T-Rex":    { rarity: "mythical",  emoji: "🦖" },
};

const FALLBACK_STOCK = {
  normal: [
    { name:"Rocket", beli:5000,   type:"Natural"   },
    { name:"Spin",   beli:7500,   type:"Natural"   },
    { name:"Blade",  beli:30000,  type:"Natural"   },
    { name:"Bomb",   beli:80000,  type:"Natural"   },
    { name:"Flame",  beli:250000, type:"Elemental" },
    { name:"Magma",  beli:960000, type:"Elemental" },
  ],
  mirage: [
    { name:"Rocket",   beli:5000,    type:"Natural"   },
    { name:"Spin",     beli:7500,    type:"Natural"   },
    { name:"Blade",    beli:30000,   type:"Natural"   },
    { name:"Spring",   beli:60000,   type:"Natural"   },
    { name:"Dark",     beli:500000,  type:"Elemental" },
    { name:"Magma",    beli:960000,  type:"Elemental" },
    { name:"Creation", beli:1400000, type:"Natural"   },
  ],
};

let currentTab    = "normal";
let stockData     = { normal: [], mirage: [] };
let lastFetchedAt = null;
const CACHE_TTL   = 5 * 60 * 1000;

/* ─── UTILS ─── */
function fmtPrice(p) {
  if (!p || p === 0) return "?";
  if (p >= 1_000_000) return (p / 1_000_000).toFixed(1).replace(".0","") + "M Beli";
  if (p >= 1_000)     return Math.round(p / 1_000) + "K Beli";
  return p + " Beli";
}

function rarityClass(r) {
  return {mythical:"r-mythical",legendary:"r-legendary",rare:"r-rare",uncommon:"r-uncommon",common:"r-common"}[r]||"r-common";
}

function getMeta(name) {
  return FRUIT_META[name] || { rarity:"common", emoji:"🍑" };
}

/* ─── CARD : emoji seulement, fiable à 100% ─── */
function buildCard(fruit) {
  const meta   = getMeta(fruit.name);
  const rarity = meta.rarity;
  const emoji  = meta.emoji;

  return `
  <div class="fruit-card in-stock">
    <div class="stock-dot in"></div>
    <div class="fruit-img-wrap">
      <span class="fruit-emoji-big">${emoji}</span>
    </div>
    <div class="fruit-name">${fruit.name}</div>
    <span class="rarity-badge ${rarityClass(rarity)}">${rarity}</span>
    <div class="type-tag">${fruit.type || ""}</div>
    <div class="fruit-price">🪙 ${fmtPrice(fruit.beli)}</div>
  </div>`;
}

/* ─── RENDER ─── */
function renderStock() {
  const fruits    = stockData[currentTab] || [];
  const container = document.getElementById("stock-container");
  if (!fruits.length) {
    container.innerHTML = `<div class="loading-overlay"><div class="loading-text">Aucun fruit trouvé.</div></div>`;
    return;
  }

  const maxPrice = fruits.reduce((m, f) => Math.max(m, f.beli||0), 0);
  const maxFruit = fruits.find(f => f.beli === maxPrice);
  document.getElementById("s-instock").textContent   = fruits.length;
  document.getElementById("s-total").textContent     = Object.keys(FRUIT_META).length;
  document.getElementById("s-expensive").textContent = maxFruit ? fmtPrice(maxPrice) : "—";

  const label = currentTab === "mirage" ? "En Stock (Mirage)" : "En Stock (Normal)";
  container.innerHTML = `
    <div class="section-header">
      <span class="section-title" style="color:var(--red)">${label}</span>
      <span class="section-badge">${fruits.length} fruits</span>
      <div class="section-line"></div>
    </div>
    <div class="fruit-grid">${fruits.map(buildCard).join("")}</div>`;
}

/* ─── LOAD STOCK ─── */
async function loadStock(force = false) {
  const btn = document.getElementById("btn-refresh");
  if (btn) btn.classList.add("spinning");
  const errEl = document.getElementById("error-msg");
  if (errEl) errEl.style.display = "none";

  if (!force && lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL) {
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
    if (!data.normal || !data.mirage) throw new Error("Format inattendu");

    stockData     = data;
    lastFetchedAt = Date.now();
    document.getElementById("s-source").textContent     = "LIVE";
    document.getElementById("last-updated").textContent = "Mise à jour : " + new Date().toLocaleTimeString("fr-FR");
    renderStock();
  } catch (err) {
    console.error("[Stock] Erreur:", err);
    if (errEl) { errEl.style.display = "block"; errEl.textContent = "⚠️ Stock live indisponible. Affichage du cache."; }
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

/* ─── TABS ─── */
function switchTab(tab) {
  currentTab = tab;
  document.getElementById("tab-normal").className = "tab" + (tab==="normal"?" active":"");
  document.getElementById("tab-mirage").className = "tab" + (tab==="mirage"?" active":"");
  updateTimer();
  renderStock();
}

/* ─── TIMER ─── */
function updateTimer() {
  const slotMs = currentTab === "mirage" ? 2*3_600_000 : 4*3_600_000;
  const now = Date.now();
  const next = Math.ceil(now / slotMs) * slotMs;
  const diff = next - now;
  const h = Math.floor(diff/3_600_000);
  const m = Math.floor((diff%3_600_000)/60_000);
  const s = Math.floor((diff%60_000)/1_000);
  document.getElementById("t-h").textContent = String(h).padStart(2,"0");
  document.getElementById("t-m").textContent = String(m).padStart(2,"0");
  document.getElementById("t-s").textContent = String(s).padStart(2,"0");
  const nd = new Date(next);
  document.getElementById("next-time").textContent =
    String(nd.getUTCHours()).padStart(2,"0")+":"+String(nd.getUTCMinutes()).padStart(2,"0")+" UTC";
}

/* ─── AI ─── */
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
        question: q,
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

/* ─── INIT ─── */
document.getElementById("ai-input")?.addEventListener("keydown", e => { if (e.key==="Enter") askAI(); });
setInterval(updateTimer, 1000);
updateTimer();
loadStock();
setInterval(() => loadStock(true), 4*60*1000);
