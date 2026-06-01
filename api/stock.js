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
  const n = name.trim().replace(/\s+/g, " ");
  // Capitalize first letter
  const clean = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
  return { name: clean, beli: BELI_PRICES[clean] || 0, type: TYPE_MAP[clean] || "Natural" };
}

async function fetchFromFandom() {
  const url = "https://blox-fruits.fandom.com/api.php?action=parse&page=Blox_Fruits_%22Stock%22&prop=wikitext&format=json&origin=*";
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "YutaBloxTracker/3.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Fandom HTTP " + res.status);
  const json = await res.json();
  const wikitext = json?.parse?.wikitext?.["*"] || "";
  if (!wikitext) throw new Error("Wikitext vide");

  // Format : |Current = Spin, Smoke, Spike, Ghost
  const match = wikitext.match(/\|Current\s*=\s*([^\n|{}]+)/i);
  if (!match) throw new Error("|Current introuvable dans: " + wikitext.slice(0,200));

  const names = match[1].split(",").map(n => n.trim()).filter(n => n.length > 0);
  if (names.length === 0) throw new Error("Aucun fruit parsé");

  const normal = names.map(makeFruit);
  console.log("[Fandom] Stock:", normal.map(f=>f.name).join(", "));
  return { normal, mirage: [] };
}

const FALLBACK = {
  normal: ["Spin","Smoke","Spike","Ghost"].map(n => ({
    name:n, beli:BELI_PRICES[n]||0, type:TYPE_MAP[n]||"Natural"
  })),
  mirage: [],
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
    console.error("[/api/stock] Erreur:", err.message);
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
