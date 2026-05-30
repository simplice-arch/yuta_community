/**
 * /api/stock.js — Vercel Serverless Function (Edge Runtime)
 * Système Multi-Source : FruityBlox API -> Fandom Wiki -> Hardcoded Fallback
 * 100% GRATUIT — Optimisé pour éviter les blocages.
 */

export const config = { runtime: "edge" };

const BELI_PRICES = {
  Rocket: 5000, Spin: 7500, Chop: 30000, Spring: 60000, Kilo: 80000,
  Bomb: 80000, Smoke: 100000, Spike: 180000, Flame: 250000, Falcon: 300000,
  Ice: 350000, Sand: 420000, Dark: 500000, Eagle: 500000, Diamond: 600000,
  Light: 650000, Love: 700000, Rubber: 750000, Barrier: 800000, Magma: 960000,
  Ghost: 940000, Door: 950000, Quake: 1000000, Buddha: 1200000, Spider: 1500000,
  Sound: 1700000, Phoenix: 1800000, Rumble: 2100000, Paw: 2300000, Blizzard: 2500000,
  Gravity: 2500000, Dough: 2800000, Mammoth: 2700000, Shadow: 2900000, Venom: 3000000,
  Control: 3200000, Dragon: 3500000, Leopard: 5000000, Pain: 2400000,
  Portal: 1400000, Creation: 1400000, "T-Rex": 2800000, Tiger: 2000000,
  Yeti: 2100000, Kitsune: 4000000, Gas: 3000000, Spirit: 3500000,
  Lightning: 2100000, String: 1500000, Blade: 30000,
};

const TYPE_MAP = {
  Rocket: "Natural", Spin: "Natural", Chop: "Natural", Spring: "Natural",
  Kilo: "Natural", Bomb: "Natural", Smoke: "Elemental", Spike: "Natural",
  Flame: "Elemental", Falcon: "Beast", Ice: "Elemental", Sand: "Elemental",
  Dark: "Elemental", Eagle: "Beast", Diamond: "Natural", Light: "Elemental",
  Love: "Natural", Rubber: "Natural", Barrier: "Natural", Magma: "Elemental",
  Ghost: "Natural", Quake: "Natural", Buddha: "Beast", Spider: "Natural",
  Sound: "Natural", Phoenix: "Beast", Rumble: "Elemental", Paw: "Natural",
  Blizzard: "Elemental", Gravity: "Natural", Dough: "Natural", Mammoth: "Beast",
  Shadow: "Natural", Venom: "Natural", Control: "Natural", Dragon: "Beast",
  Leopard: "Beast", Pain: "Natural", Portal: "Natural", Creation: "Natural",
  Blade: "Natural", Lightning: "Elemental", Tiger: "Beast",
};

function makeFruit(name) {
  // Corrige l'éventuel alias "Blade" en "Chop" pour matcher le dictionnaire officiel du jeu
  const exactName = name === "Blade" ? "Chop" : name;
  return {
    name: exactName,
    beli: BELI_PRICES[exactName] || 0,
    type: TYPE_MAP[exactName] || "Natural",
  };
}

// SOURCE 1 : Tentative de récupération directe via FruityBlox (Temps Réel)
async function fetchFromFruityBlox() {
  const url = "https://fruityblox.com/api/stock"; // Note : Assure-toi que c'est le bon endpoint de leur API interne
  
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error("FruityBlox HTTP Erreur " + res.status);
  
  const data = await res.json();
  if (!data.normal || data.normal.length === 0) throw new Error("Données FruityBlox invalides");

  return {
    normal: data.normal.map(f => makeFruit(f.name || f)),
    mirage: data.mirage ? data.mirage.map(f => makeFruit(f.name || f)) : []
  };
}

// SOURCE 2 : Secours via l'API Wikitext de Fandom
async function fetchFromFandom() {
  const url = "https://blox-fruits.fandom.com/api.php?action=parse&page=Blox_Fruits_%22Stock%22&prop=wikitext&format=json&origin=*";

  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "YutaBloxTracker/2.0" },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) throw new Error("Fandom HTTP " + res.status);

  const json = await res.json();
  const wikitext = json?.parse?.wikitext?.["*"] || "";
  if (!wikitext) throw new Error("Wikitext Fandom vide");

  const normal = [];
  const mirage = [];
  const lines = wikitext.split("\n");
  
  let currentSection = "normal";

  for (const line of lines) {
    if (/mirage/i.test(line)) currentSection = "mirage";

    if (/\{\{(yes|current)/i.test(line) || /\|\s*yes\s*\|/i.test(line) || /\b(yes)\b/i.test(line)) {
      const m = line.match(/\[\[([A-Za-z\-\s]+?)(?:\|[^\]]*)?\]\]/);
      if (m) {
        const name = m[1].trim();
        if (name && BELI_PRICES[name] !== undefined) {
          if (currentSection === "normal") {
            if (!normal.some(f => f.name === name)) normal.push(makeFruit(name));
          } else {
            if (!mirage.some(f => f.name === name)) mirage.push(makeFruit(name));
          }
        }
      }
    }
  }

  if (normal.length === 0) throw new Error("Aucun fruit parsé sur Fandom");

  return { 
    normal, 
    mirage: mirage.length > 0 ? mirage : normal.slice(0, 4) 
  };
}

// SOURCE 3 : Fallback ultime si tout échoue (Basé sur ton dernier stock fonctionnel officiel)
const ULTIMATE_FALLBACK = {
  normal: ["Rocket", "Spin", "Chop", "Bomb", "Flame", "Magma"].map(makeFruit),
  mirage: ["Rocket", "Spin", "Chop", "Spring", "Dark", "Magma", "Creation"].map(makeFruit),
};

// Handler principal de la fonction Serverless Vercel
export default async function handler(req) {
  let sourceUsed = "fruityblox";
  let stockData = null;

  try {
    // 1. On tente FruityBlox en premier
    stockData = await fetchFromFruityBlox();
    console.log("[/api/stock] ✅ Success: Récupéré depuis FruityBlox");
  } catch (errFruity) {
    console.warn("[/api/stock] ⚠️ FruityBlox échoué, bascule sur Fandom:", errFruity.message);
    try {
      // 2. Si ça échoue (blocage IP, etc.), on tente Fandom
      stockData = await fetchFromFandom();
      sourceUsed = "fandom";
      console.log("[/api/stock] ✅ Success: Récupéré depuis Fandom");
    } catch (errFandom) {
      // 3. Si Fandom échoue aussi, on envoie le Fallback figé propre
      console.error("[/api/stock] ❌ Toutes les API ont échoué. Envoi du Ultimate Fallback:", errFandom.message);
      stockData = ULTIMATE_FALLBACK;
      sourceUsed = "fallback";
    }
  }

  return new Response(JSON.stringify(stockData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Access-Control-Allow-Origin": "*",
      "X-Stock-Source": sourceUsed,
    },
  });
}
