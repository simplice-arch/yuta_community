/**
 * /api/stock.js — Vercel Serverless Function
 * Source : Fandom Wiki API -> Fallback
 * 100% GRATUIT
 */
export const config = { runtime: "edge" };

const BELI_PRICES = {
  Rocket:5000, Spin:7500, Chop:30000, Spring:60000, Kilo:80000,
  Bomb:80000, Smoke:100000, Spike:180000, Flame:250000, Falcon:300000,
  Ice:350000, Sand:420000, Dark:500000, Eagle:500000, Diamond:600000,
  Light:650000, Love:700000, Rubber:750000, Barrier:800000, Magma:960000,
  Ghost:940000, Quake:1000000, Buddha:1200000, Spider:1500000,
  Sound:1700000, Phoenix:1800000, Rumble:2100000, Paw:2300000,
  Blizzard:2500000, Gravity:2500000, Dough:2800000, Mammoth:2700000,
  Shadow:2900000, Venom:3000000, Control:3200000, Dragon:3500000,
  Leopard:5000000, Pain:2400000, Portal:1400000, Creation:1400000,
  "T-Rex":2800000, Tiger:2000000, Yeti:2100000, Kitsune:4000000,
  Gas:3000000, Spirit:3500000, Lightning:2100000, Blade:30000,
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
  return {
    name,
    beli: BELI_PRICES[name] || 0,
    type: TYPE_MAP[name] || "Natural",
  };
}

async function fetchFromFandom() {
  const url = "https://blox-fruits.fandom.com/api.php?action=parse&page=Blox_Fruits_%22Stock%22&prop=wikitext&format=json&origin=*";
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "YutaBloxTracker/2.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Fandom HTTP " + res.status);
  const json = await res.json();
  const wikitext = json?.parse?.wikitext?.["*"] || "";
  if (!wikitext) throw new Error("Wikitext vide");

  const normal = [];
  const mirage = [];
  let section = "normal";
  const lines = wikitext.split("\n");

  for (const line of lines) {
    if (/mirage/i.test(line)) section = "mirage";
    if (!/\|\|\s*Yes\b/i.test(line) && !/\|\s*Yes\s*\|/i.test(line)) continue;
    const m = line.match(/\[\[([A-Za-z\-\s]+?)(?:\|[^\]]*)?\]\]/);
    if (!m) continue;
    const name = m[1].trim();
    if (!BELI_PRICES[name]) continue;
    const fruit = makeFruit(name);
    if (section === "normal" && !normal.some(f => f.name === name)) normal.push(fruit);
    else if (section === "mirage" && !mirage.some(f => f.name === name)) mirage.push(fruit);
  }

  if (normal.length === 0) throw new Error("Aucun fruit parsé");
  return { normal, mirage };
}

const FALLBACK = {
  normal: ["Rocket","Spin","Blade","Bomb","Flame","Magma"].map(makeFruit),
  mirage: ["Rocket","Spin","Blade","Spring","Dark","Magma","Creation"].map(makeFruit),
};

export default async function handler(req) {
  try {
    const data = await fetchFromFandom();
    console.log("[/api/stock] ✅ Fandom OK:", data.normal.map(f=>f.name).join(", "));
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
    console.error("[/api/stock] ❌ Erreur:", err.message, "→ fallback");
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
