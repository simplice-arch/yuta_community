export const config = { runtime: "edge" };

const BELI_PRICES = {
  Rocket:5000, Spin:7500, Chop:30000, Spring:60000, Kilo:80000,
  Bomb:80000, Smoke:100000, Spike:180000, Flame:250000, Falcon:300000,
  Ice:350000, Sand:420000, Dark:500000, Eagle:550000, Diamond:600000,
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

const RARITY_MAP = {
  Rocket:"common", Spin:"common", Chop:"common", Spring:"common", Kilo:"common",
  Bomb:"uncommon", Smoke:"uncommon", Spike:"uncommon", Blade:"uncommon",
  Flame:"rare", Ice:"rare", Sand:"rare", Dark:"rare", Eagle:"rare",
  Diamond:"rare", Rubber:"rare", Falcon:"rare",
  Light:"legendary", Love:"legendary", Magma:"legendary", Ghost:"legendary",
  Quake:"legendary", Buddha:"legendary", Spider:"legendary", Sound:"legendary",
  Shadow:"legendary", Portal:"legendary", Creation:"legendary",
  Phoenix:"mythical", Rumble:"mythical", Paw:"mythical", Blizzard:"mythical",
  Gravity:"mythical", Dough:"mythical", Mammoth:"mythical", Venom:"mythical",
  Control:"mythical", Dragon:"mythical", Leopard:"mythical", Pain:"mythical",
  Tiger:"mythical", Yeti:"mythical", Kitsune:"mythical", Gas:"mythical",
  Spirit:"mythical", Lightning:"mythical",
};

function makeFruit(raw) {
  const name = typeof raw === "string" ? raw : (raw.name || "Unknown");
  const n = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    name: n,
    beli: (typeof raw === "object" && raw.price) ? raw.price : (BELI_PRICES[n] || 0),
    type: (typeof raw === "object" && raw.type) ? raw.type : (TYPE_MAP[n] || "Natural"),
    rarity: RARITY_MAP[n] || "common",
    img: (typeof raw === "object" && raw.image) ? `https://fruityblox.com${raw.image}` : null,
  };
}

async function fetchFromFruityBlox() {
  const res = await fetch("https://fruityblox.com/stock", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error("FruityBlox HTTP " + res.status);
  const html = await res.text();

  // Extraire __NEXT_DATA__
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("__NEXT_DATA__ introuvable");

  const nextData = JSON.parse(match[1]);
  const str = JSON.stringify(nextData);

  // Chercher "normal":[...] et "mirage":[...] dans le JSON
  // Les objets fruit ont "name", "price", "type", "image"
  const normalMatch = str.match(/"normal":\[(\{(?:[^{}]|\{[^{}]*\})*\}(?:,\{(?:[^{}]|\{[^{}]*\})*\})*)\]/);
  const mirageMatch = str.match(/"mirage":\[(\{(?:[^{}]|\{[^{}]*\})*\}(?:,\{(?:[^{}]|\{[^{}]*\})*\})*)\]/);

  if (!normalMatch) throw new Error("Données normal introuvables");

  const normal = JSON.parse("[" + normalMatch[1] + "]").map(makeFruit);
  const mirage = mirageMatch ? JSON.parse("[" + mirageMatch[1] + "]").map(makeFruit) : [];

  if (!normal.length) throw new Error("Aucun fruit parsé");

  console.log("[FruityBlox] ✅ Normal:", normal.map(f=>f.name).join(", "));
  if (mirage.length) console.log("[FruityBlox] Mirage:", mirage.map(f=>f.name).join(", "));

  return { normal, mirage };
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
  const match = wikitext.match(/\|Current\s*=\s*([^\n|{}]+)/i);
  if (!match) throw new Error("|Current introuvable");

  const names = match[1].split(",").map(n => n.trim()).filter(n => n.length > 0);
  if (!names.length) throw new Error("Aucun fruit");

  console.log("[Fandom] ✅ Current:", names.join(", "));
  return { normal: names.map(makeFruit), mirage: [] };
}

const FALLBACK = {
  normal: ["Rocket","Spin","Blade","Eagle","Light","Creation"].map(makeFruit),
  mirage: ["Rocket","Spin","Blade","Spring","Flame","Ghost","Phoenix"].map(makeFruit),
};

export default async function handler(req) {
  try {
    const data = await fetchFromFruityBlox();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Access-Control-Allow-Origin": "*",
        "X-Stock-Source": "fruityblox",
      },
    });
  } catch (e1) {
    console.warn("[/api/stock] FruityBlox échoué:", e1.message);
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
    } catch (e2) {
      console.error("[/api/stock] Toutes sources échouées:", e2.message);
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
}
