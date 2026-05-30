/* ─────────────────────────────────────────────
   YUTA BLOX COMMUNITY — app.js
   Stock Tracker Frontend
   ───────────────────────────────────────────── */

// ─── CDN Fandom pour les vraies icônes des fruits ───
const WIKI = "https://static.wikia.nocookie.net/blox-fruits/images";

const FRUIT_META = {
  "Rocket":   { img: `${WIKI}/d/dd/Rocket_Fruit_Icon.png`,   rarity: "common"   },
  "Spin":     { img: `${WIKI}/3/3b/Spin_Fruit_Icon.png`,     rarity: "common"   },
  "Chop":     { img: `${WIKI}/5/5e/Chop_Fruit_Icon.png`,     rarity: "common"   },
  "Spring":   { img: `${WIKI}/5/58/Spring_Fruit_Icon.png`,   rarity: "common"   },
  "Bomb":     { img: `${WIKI}/4/4d/Bomb_Fruit_Icon.png`,     rarity: "uncommon" },
  "Blade":    { img: `${WIKI}/e/e2/Blade_Fruit_Icon.png`,    rarity: "uncommon" },
  "Smoke":    { img: `${WIKI}/7/7f/Smoke_Fruit_Icon.png`,    rarity: "uncommon" },
  "Spike":    { img: `${WIKI}/b/b5/Spike_Fruit_Icon.png`,    rarity: "uncommon" },
  "Flame":    { img: `${WIKI}/2/2b/Flame_Fruit_Icon.png`,    rarity: "rare"     },
  "Ice":      { img: `${WIKI}/4/4e/Ice_Fruit_Icon.png`,      rarity: "rare"     },
  "Sand":     { img: `${WIKI}/4/4f/Sand_Fruit_Icon.png`,     rarity: "rare"     },
  "Dark":     { img: `${WIKI}/f/f6/Dark_Fruit_Icon.png`,     rarity: "rare"     },
  "Diamond":  { img: `${WIKI}/c/c3/Diamond_Fruit_Icon.png`,  rarity: "rare"     },
  "Spider":   { img: `${WIKI}/8/8f/Spider_Fruit_Icon.png`,   rarity: "rare"     },
  "Rubber":   { img: `${WIKI}/b/b4/Rubber_Fruit_Icon.png`,   rarity: "rare"     },
  "Eagle":    { img: `${WIKI}/4/4b/Eagle_Fruit_Icon.png`,    rarity: "rare"     },
  "Magma":    { img: `${WIKI}/8/8e/Magma_Fruit_Icon.png`,    rarity: "legendary"},
  "Quake":    { img: `${WIKI}/f/f8/Quake_Fruit_Icon.png`,    rarity: "legendary"},
  "Light":    { img: `${WIKI}/b/b7/Light_Fruit_Icon.png`,    rarity: "legendary"},
  "Ghost":    { img: `${WIKI}/e/e3/Ghost_Fruit_Icon.png`,    rarity: "legendary"},
  "Mammoth":  { img: `${WIKI}/2/2c/Mammoth_Fruit_Icon.png`,  rarity: "legendary"},
  "Sound":    { img: `${WIKI}/9/9b/Sound_Fruit_Icon.png`,    rarity: "legendary"},
  "Dough":    { img: `${WIKI}/b/b6/Dough_Fruit_Icon.png`,    rarity: "legendary"},
  "Buddha":   { img: `${WIKI}/2/2a/Buddha_Fruit_Icon.png`,   rarity: "legendary"},
  "Phoenix":  { img: `${WIKI}/0/06/Phoenix_Fruit_Icon.png`,  rarity: "mythical" },
  "Rumble":   { img: `${WIKI}/1/1d/Rumble_Fruit_Icon.png`,   rarity: "mythical" },
  "Paw":      { img: `${WIKI}/a/a2/Paw_Fruit_Icon.png`,      rarity: "mythical" },
  "Blizzard": { img: `${WIKI}/3/3d/Blizzard_Fruit_Icon.png`, rarity: "mythical" },
  "Control":  { img: `${WIKI}/5/5d/Control_Fruit_Icon.png`,  rarity: "mythical" },
  "Dragon":   { img: `${WIKI}/6/6a/Dragon_Fruit_Icon.png`,   rarity: "mythical" },
  "Venom":    { img: `${WIKI}/9/94/Venom_Fruit_Icon.png`,    rarity: "mythical" },
  "Leopard":  { img: `${WIKI}/e/e4/Leopard_Fruit_Icon.png`,  rarity: "mythical" },
  "Shadow":   { img: `${WIKI}/5/5a/Shadow_Fruit_Icon.png`,   rarity: "legendary"},
  "Gravity":  { img: `${WIKI}/b/bf/Gravity_Fruit_Icon.png`,  rarity: "mythical" },
  "Love":     { img: `${WIKI}/2/27/Love_Fruit_Icon.png`,     rarity: "legendary"},
  "Pain":     { img: `${WIKI}/1/1b/Pain_Fruit_Icon.png`,     rarity: "mythical" },
  "Portal":   { img: `${WIKI}/5/5c/Portal_Fruit_Icon.png`,   rarity: "legendary"},
  "Kitsune":  { img: `${WIKI}/k/kt/Kitsune_Fruit_Icon.png`,  rarity: "mythical" },
  "Tiger":    { img: `${WIKI}/t/ti/Tiger_Fruit_Icon.png`,    rarity: "mythical" },
  "Yeti":     { img: `${WIKI}/y/ye/Yeti_Fruit_Icon.png`,     rarity: "mythical" },
  "Gas":      { img: `${WIKI}/g/ga/Gas_Fruit_Icon.png`,      rarity: "mythical" },
  "Spirit":   { img: `${WIKI}/s/sp/Spirit_Fruit_Icon.png`,   rarity: "mythical" },
  "T-Rex":    { img: `${WIKI}/t/tr/T-Rex_Fruit_Icon.png`,    rarity: "mythical" },
};

// Fallback emoji si l'image wiki ne charge pas
const EMOJI_FALLBACK = {
  common: "🔵", uncommon: "🟣", rare: "🔵", legendary: "🟡", mythical: "🔴"
};

const FALLBACK_STOCK = {
  normal: [
    { name: "Rocket", beli: 5000,    type: "Natural"   },
    { name: "Spin",   beli: 7500,    type: "Natural"   },
    { name: "Smoke",  beli: 100000,  type: "Elemental" },
    { name: "Spike",  beli: 180000,  type: "Natural"   },
    { name: "Sand",   beli: 420000,  type: "Elemental" },
  ],
  mirage: [
    { name: "Rocket", beli: 5000,    type: "Natural"   },
    { name: "Flame",  beli: 250000,  type: "Elemental" },
    { name: "Dark",   beli: 500000,  type: "Elemental" },
    { name: "Dough",  beli: 2800000, type: "Natural"   },
    { name: "Venom",  beli: 3000000, type: "Natural"   },
  ],
};

let currentTab    = "normal";
let stockData     = { normal: [], mirage: [] };
let lastFetchedAt = null;
const CACHE_TTL   = 5 * 60 * 1000;

/* ─── UTILS ─── */
function fmtPrice(p) {
  if (!p || p === 0) return "?";
  if (p >= 1_000_000) return (p / 1_000_000).toFixed(1) + "M Beli";
  if (p >= 1_000)     return Math.round(p / 1_000) + "K Beli";
  return p + " Beli";
}

function rarityClass(r) {
  return { mythical:"r-mythical", legendary:"r-legendary",
           rare:"r-rare", uncommon:"r-uncommon", common:"r-common" }[r] || "r-common";
}

function getFruitImg(name) {
  const meta = FRUIT_META[name];
  if (meta) return meta.img;
  // Essaie une URL générique si le fruit n'est pas dans la table
  return `${WIKI}/${name}_Fruit_Icon.png`;
}

function getFruitRarity(name) {
  return FRUIT_META[name]?.rarity || "common";
}

/* ─── CARD BUILDER avec vraie image ─── */
function buildCard(fruit) {
  const rarity = getFruitRarity(fruit.name);
  const imgUrl = getFruitImg(fruit.name);

  return `
  <div class="fruit-card in-stock">
    <div class="stock-dot in"></div>
    <div class="fruit-img-wrap">
      <img
        class="fruit-img"
        src="${imgUrl}"
        alt="${fruit.name}"
        loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
      />
      <span class="fruit-emoji-fallback" style="display:none">${EMOJI_FALLBACK[rarity] || "🍑"}</span>
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
    container.innerHTML = `
      <div class="loading-overlay">
        <div class="loading-text">Aucun fruit trouvé pour ce stock.</div>
      </div>`;
    return;
  }

  const maxPrice = fruits.reduce((m, f) => Math.max(m, f.beli || 0), 0);
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
  btn.classList.add("spinning");
  document.getElementById("error-msg").style.display = "none";

  if (!force && lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL) {
    renderStock();
    btn.classList.remove("spinning");
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

    document.getElementById("s-source").textContent    = "LIVE";
    document.getElementById("last-updated").textContent =
      "Mise à jour : " + new Date().toLocaleTimeString("fr-FR");

    renderStock();
  } catch (err) {
    console.error("[Stock] Erreur:", err);
    showError("⚠️ Stock live indisponible. Affichage du dernier stock connu.");

    if (!stockData.normal.length) {
      stockData     = FALLBACK_STOCK;
      lastFetchedAt = Date.now();
      document.getElementById("s-source").textContent    = "CACHE";
      document.getElementById("last-updated").textContent =
        "Cache : " + new Date().toLocaleTimeString("fr-FR");
    }
    renderStock();
  }

  btn.classList.remove("spinning");
}

/* ─── TABS ─── */
function switchTab(tab) {
  currentTab = tab;
  document.getElementById("tab-normal").className = "tab" + (tab === "normal" ? " active" : "");
  document.getElementById("tab-mirage").className = "tab" + (tab === "mirage" ? " active" : "");
  updateTimer();
  renderStock();
}

/* ─── TIMER ─── */
function updateTimer() {
  const slotMs = currentTab === "mirage" ? 2 * 3_600_000 : 4 * 3_600_000;
  const now    = Date.now();
  const next   = Math.ceil(now / slotMs) * slotMs;
  const diff   = next - now;

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);

  document.getElementById("t-h").textContent = String(h).padStart(2, "0");
  document.getElementById("t-m").textContent = String(m).padStart(2, "0");
  document.getElementById("t-s").textContent = String(s).padStart(2, "0");

  const nd = new Date(next);
  document.getElementById("next-time").textContent =
    String(nd.getUTCHours()).padStart(2, "0") + ":" +
    String(nd.getUTCMinutes()).padStart(2, "0") + " UTC";
}

/* ─── AI ASSISTANT ─── */
async function askAI() {
  const inp  = document.getElementById("ai-input");
  const resp = document.getElementById("ai-resp");
  const btn  = document.getElementById("btn-ask");
  const q    = inp.value.trim();
  if (!q) return;

  btn.disabled   = true;
  resp.innerHTML = '<span class="ai-thinking">Réflexion en cours...</span><span class="ai-cursor"></span>';

  try {
    const res  = await fetch("/api/ask", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        question:    q,
        normalStock: stockData.normal.map(f => f.name).join(", ") || "aucun",
        mirageStock: stockData.mirage.map(f => f.name).join(", ") || "aucun",
      }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    resp.textContent = data.answer || "Pas de réponse.";
  } catch {
    resp.innerHTML = '<span class="ai-thinking">Erreur de connexion à l\'assistant.</span>';
  }

  btn.disabled = false;
}

function showError(msg) {
  const el = document.getElementById("error-msg");
  el.style.display = "block";
  el.textContent   = msg;
}

/* ─── INIT ─── */
document.getElementById("ai-input").addEventListener("keydown", e => {
  if (e.key === "Enter") askAI();
});

setInterval(updateTimer, 1000);
updateTimer();
loadStock();
setInterval(() => loadStock(true), 4 * 60 * 1000);
