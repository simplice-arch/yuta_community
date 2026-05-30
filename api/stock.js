/**
 * /api/stock.js — Vercel Serverless Function (Edge Runtime)
 * Source : Wiki Fandom Blox Fruits (API wikitext)
 * 100% GRATUIT — Aucune clé API requise.
 */

export const config = { runtime: "edge" };

const BELI_PRICES = {
  Rocket:5000, Spin:7500, Chop:30000, Spring:60000, Kilo:80000,
  Bomb:80000, Smoke:100000, Spike:180000, Flame:250000, Falcon:300000,
  Ice:350000, Sand:420000, Dark:500000, Eagle:500000, Diamond:600000,
  Light:650000, Love:700000, Rubber:750000, Barrier:800000, Magma:960000, // Mis à jour à 960k
  Ghost:940000, Door:950000, Quake:1000000, Buddha:1200000, Spider:1500000,
  Sound:1700000, Phoenix:1800000, Rumble:2100000, Paw:2300000, Blizzard:2500000,
  Gravity:2500000, Dough:2800000, Mammoth:2700000, Shadow:2900000, Venom:3000000,
  Control:3200000, Dragon:3500000, Leopard:5000000, Pain:2400000,
  Portal:1400000, Creation:1400000, "T-Rex":2800000, Tiger:2000000,
  Yeti:2100000, Kitsune:4000000, Gas:3000000, Spirit:3500000,
  Lightning:2100000, String:1500000, Blade:30000,
};

const TYPE_MAP = {
  Rocket:"Natural", Spin:"Natural", Chop:"Natural", Spring:"Natural",
  Kilo:"Natural", Bomb:"Natural", Smoke:"Elemental", Spike:"Natural",
  Flame:"Elemental", Falcon:"Beast", Ice:"Elemental", Sand:"Elemental",
  Dark:"Elemental", Eagle:"Beast", Diamond:"Natural", Light:"Elemental",
  Love:"Natural", Rubber:"Natural", Barrier:"Natural", Magma:"Elemental",
  Ghost:"Natural", Quake:"Natural", Buddha:"Beast", Spider:"Natural",
  Sound:"Natural", Phoenix:"Beast", Rumble:"Elemental", Paw:"Natural",
  Blizzard:"Elemental", Gravity:"Natural", Dough:"Natural", Mammoth:"Beast",
  Shadow:"Natural", Venom:"Natural", Control:"Natural", Dragon:"Beast",
  Leopard:"Beast", Pain:"Natural", Portal:"Natural", Creation:"Natural",
  Blade:"Natural", Lightning:"Elemental", Tiger:"Beast",
};

function makeFruit(name) {
  // Gestion de l'alias Blade -> Chop pour correspondre à ton dictionnaire
  const exactName = name === "Blade" ? "Chop" : name;
  return {
    name: exactName,
    beli: BELI_PRICES[exactName] || 0,
    type: TYPE_MAP[exactName] || "Natural",
  };
}

async function fetchFromFandom() {
  const url = "https://blox-fruits.fandom.com/api.php?action=parse&page=Blox_Fruits_%22Stock%22&prop=wikitext&format=json&origin=*";

  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "YutaBloxTracker/2.0" },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error("Fandom HTTP " + res.status);

  const json = await res.json();
  const wikitext = json?.parse?.wikitext?.["*"] || "";
  if (!wikitext) throw new Error("Wikitext vide");

  const normal = [];
  const mirage = [];

  // Découpage par blocs pour isoler le Stock Normal du Stock Mirage s'ils sont séparés
  const lines = wikitext.split("\n");
  
  let currentSection = "normal";

  for (const line of lines) {
    // Si on croise une mention de Mirage, on bascule le remplissage sur mirage
    if (/mirage/i.test(line)) {
      currentSection = "mirage";
    }

    // Capture des lignes contenant un lien de fruit [[NomFruit]] ET une意 (validation "Yes" ou icône verte)
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

  // Fallback intra-texte si le tableau principal a échoué à cause d'un changement de template
  if (normal.length === 0) {
    const cleanText = wikitext.replace(/<[^>]*>/g, ""); // Supprime les balises HTML résiduelles
    for (const fruit of Object.keys(BELI_PRICES)) {
      const regex = new RegExp(`\\[\\[${fruit}\\]\\].*?\\b(Yes|Current)\\b`, "i");
      if (regex.test(cleanText)) {
        normal.push(makeFruit(fruit));
      }
    }
  }

  // Si après tout ça, Fandom ne renvoie rien, on lève l'erreur pour activer le gros FALLBACK global
  if (normal.length === 0) throw new Error("Aucun fruit parsé dans Normal Stock");

  // Si le Mirage est resté vide lors du parsing, on le duplique ou on applique une sélection
  return { 
    normal, 
    mirage: mirage.length > 0 ? mirage : normal.slice(0, 4) // Ajustement dynamique si vide
  };
}

const FALLBACK = {
  normal: ["Rocket","Spin","Chop","Bomb","Flame","Magma"].map(makeFruit),
  mirage: ["Rocket","Spin","Chop","Spring","Dark","Magma","Creation"].map(makeFruit),
};

export default async function handler(req) {
  try {
    const data = await fetchFromFandom();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Access-Control-Allow-Origin": "*",
        "X-Stock-Source": "fandom",
      },
    });
  } catch (err) {
    console.error("[/api/stock] Erreur scraping:", err.message);
    return new Response(JSON.stringify(FALLBACK), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "X-Stock-Source": "fallback",
      },
    });
  }
}
