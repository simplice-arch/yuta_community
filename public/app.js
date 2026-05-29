/* ─────────────────────────────────────────────
   YUTA BLOX COMMUNITY — app.js
   Stock Tracker Frontend
   ───────────────────────────────────────────── */

const FRUIT_META = {
  "Rocket":   { emoji: "🚀", rarity: "common"   },
  "Spin":     { emoji: "🌀", rarity: "common"   },
  "Chop":     { emoji: "🪓", rarity: "common"   },
  "Spring":   { emoji: "🌿", rarity: "common"   },
  "Bomb":     { emoji: "💣", rarity: "uncommon" },
  "Blade":    { emoji: "⚔️",  rarity: "uncommon" },
  "Smoke":    { emoji: "💨", rarity: "uncommon" },
  "Spike":    { emoji: "🌵", rarity: "uncommon" },
  "Flame":    { emoji: "🔥", rarity: "rare"     },
  "Ice":      { emoji: "🧊", rarity: "rare"     },
  "Sand":     { emoji: "⏳", rarity: "rare"     },
  "Dark":     { emoji: "🌑", rarity: "rare"     },
  "Diamond":  { emoji: "💎", rarity: "rare"     },
  "Spider":   { emoji: "🕷️", rarity: "rare"     },
  "Rubber":   { emoji: "🟡", rarity: "rare"     },
  "Magma":    { emoji: "🌋", rarity: "legendary"},
  "Quake":    { emoji: "🌊", rarity: "legendary"},
  "Light":    { emoji: "✨", rarity: "legendary"},
  "Ghost":    { emoji: "👻", rarity: "legendary"},
  "Mammoth":  { emoji: "🦣", rarity: "legendary"},
  "Sound":    { emoji: "🎵", rarity: "legendary"},
  "Dough":    { emoji: "🥐", rarity: "legendary"},
  "Phoenix":  { emoji: "🦅", rarity: "mythical" },
  "Rumble":   { emoji: "⚡", rarity: "mythical" },
  "Paw":      { emoji: "🐾", rarity: "mythical" },
  "Blizzard": { emoji: "❄️",  rarity: "mythical" },
  "Control":  { emoji: "🎮", rarity: "mythical" },
  "Dragon":   { emoji: "🐉", rarity: "mythical" },
  "Venom":    { emoji: "🐍", rarity: "mythical" },
  "Leopard":  { emoji: "🐆", rarity: "mythical" },
};

const FALLBACK_STOCK = {
  normal: [
    { name: "Rocket",  beli: 5000,    type: "Natural"   },
    { name: "Spin",    beli: 7500,    type: "Natural"   },
    { name: "Blade",   beli: 30000,   type: "Natural"   },
    { name: "Bomb",    beli: 80000,   type: "Natural"   },
    { name: "Ice",     beli: 350000,  type: "Elemental" },
    { name: "Phoenix", beli: 1800000, type: "Beast"     },
  ],
  mirage: [
    { name: "Rocket",  beli: 5000,   type: "Natural"   },
    { name: "Spin",    beli: 7500,   type: "Natural"   },
    { name: "Spring",  beli: 60000,  type: "Natural"   },
    { name: "Flame",   beli: 250000, type: "Elemental" },
    { name: "Dark",    beli: 500000, type: "Elemental" },
    { name: "Diamond", beli: 600000, type: "Natural"   },
    { name: "Light",   beli: 650000, type: "Elemental" },
    { name: "Rubber",  beli: 750000, type: "Natural"   },
  ],
};

let currentTab    = "normal";
let stockData     = { normal: [], mirage: [] };
let lastFetchedAt = null;
const CACHE_TTL   = 5 * 60 * 1000; // 5 min

/* ─── UTILS ─── */
function fmtPrice(p) {
  if (!p || p === 0) return "?";
  if (p >= 1_000_000) return (p / 1_000_000).toFixed(1) + "M Beli";
  if (p >= 1_000)     return Math.round(p / 1_000) + "K Beli";
  return p + " Beli";
}

function rarityClass(r) {
  return { mythical: "r-mythical", legendary: "r-legendary",
           rare: "r-rare", uncommon: "r-uncommon", common: "r-common" }[r] || "r-common";
}

/* ─── CARD BUILDER ─── */
function buildCard(fruit) {
  const meta = FRUIT_META[fruit.name] || { emoji: "🍑", rarity: "common" };
  return `
  <div class="fruit-card in-stock">
    <div class="stock-dot in"></div>
    <span class="fruit-emoji">${meta.emoji}</span>
    <div class="fruit-name">${fruit.name}</div>
    <span class="rarity-badge ${rarityClass(meta.rarity)}">${meta.rarity}</span>
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

/* ─── LOAD STOCK (via proxy route /api/stock) ─── */
async function loadStock(force = false) {
  const btn = document.getElementById("btn-refresh");
  btn.classList.add("spinning");
  document.getElementById("error-msg").style.display = "none";

  // Use cache if fresh
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
    console.error("[Stock] Erreur fetch:", err);
    showError("⚠️ Impossible de récupérer le stock live. Affichage du dernier stock connu.");

    // Fallback to last known or hardcoded
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

  btn.disabled  = true;
  resp.innerHTML = '<span class="ai-thinking">Réflexion en cours...</span><span class="ai-cursor"></span>';

  try {
    const res  = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question:    q,
        normalStock: stockData.normal.map(f => f.name).join(", ") || "aucun",
        mirageStock: stockData.mirage.map(f => f.name).join(", ") || "aucun",
      }),
    });

    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    resp.textContent = data.answer || "Pas de réponse.";
  } catch (err) {
    resp.innerHTML = '<span class="ai-thinking">Erreur de connexion à l\'assistant. Réessaie dans un instant.</span>';
  }

  btn.disabled = false;
}

/* ─── HELPERS ─── */
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

// Auto-refresh every 4 minutes
setInterval(() => loadStock(true), 4 * 60 * 1000);
