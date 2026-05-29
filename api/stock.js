/**
 * /api/stock.js — Vercel Serverless Function
 *
 * Source : blox-fruits-api.onrender.com — API communautaire publique gratuite
 * qui récupère le stock directement depuis le jeu Blox Fruits.
 *
 * Retourne : { normal: [...], mirage: [...] }
 */

export const config = { runtime: "edge" };

const FALLBACK = {
  normal: [
    { name: "Rocket", beli: 5000,    type: "Natural"   },
    { name: "Spin",   beli: 7500,    type: "Natural"   },
    { name: "Smoke",  beli: 100000,  type: "Elemental" },
    { name: "Spike",  beli: 180000,  type: "Natural"   },
    { name: "Sand",   beli: 420000,  type: "Elemental" },
  ],
  mirage: [
    { name: "Rocket", beli: 5000,    type: "Natural"   },
    { name: "Spin",   beli: 7500,    type: "Natural"   },
    { name: "Blade",  beli: 30000,   type: "Natural"   },
    { name: "Bomb",   beli: 80000,   type: "Natural"   },
    { name: "Flame",  beli: 250000,  type: "Elemental" },
    { name: "Dark",   beli: 500000,  type: "Elemental" },
    { name: "Eagle",  beli: 550000,  type: "Beast"     },
    { name: "Dough",  beli: 2800000, type: "Natural"   },
    { name: "Venom",  beli: 3000000, type: "Natural"   },
  ],
};

/**
 * Normalise les données de l'API communautaire vers notre format interne
 * Format attendu de l'API : [{ name, beli, robux, type }, ...]
 */
function normalize(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(f => ({
    name: f.name  || f.Name  || f.fruit || "Unknown",
    beli: parseInt(f.beli  || f.Beli  || f.price || f.Price || 0, 10),
    type: f.type  || f.Type  || f.category || "Natural",
  })).filter(f => f.name !== "Unknown");
}

export default async function handler(req) {
  try {
    // Appel à l'API communautaire publique
    const res = await fetch("https://blox-fruits-api.onrender.com/api/bloxfruits/stock", {
      headers: {
        "Accept":     "application/json",
        "User-Agent": "YutaBloxTracker/1.0",
      },
      signal: AbortSignal.timeout(8000), // timeout 8s
    });

    if (!res.ok) throw new Error("API HTTP " + res.status);

    const raw = await res.json();

    // L'API peut retourner un string JSON ou un objet directement
    let data = raw;
    if (typeof raw === "string") {
      try { data = JSON.parse(raw); } catch { data = raw; }
    }

    // Cas 1 : { normal: [...], mirage: [...] }
    if (data.normal && data.mirage) {
      return new Response(JSON.stringify({
        normal: normalize(data.normal),
        mirage: normalize(data.mirage),
      }), {
        status: 200,
        headers: {
          "Content-Type":                "application/json",
          "Cache-Control":               "public, s-maxage=240, stale-while-revalidate=60",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Cas 2 : { Normal: [...], Mirage: [...] }
    if (data.Normal || data.Mirage) {
      return new Response(JSON.stringify({
        normal: normalize(data.Normal || []),
        mirage: normalize(data.Mirage || []),
      }), {
        status: 200,
        headers: {
          "Content-Type":                "application/json",
          "Cache-Control":               "public, s-maxage=240, stale-while-revalidate=60",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Cas 3 : tableau plat avec un champ type/dealer
    if (Array.isArray(data)) {
      const normal = data.filter(f =>
        (f.dealer || f.type || "").toLowerCase().includes("normal") ||
        !(f.dealer || f.type || "").toLowerCase().includes("mirage")
      );
      const mirage = data.filter(f =>
        (f.dealer || f.type || "").toLowerCase().includes("mirage")
      );
      return new Response(JSON.stringify({
        normal: normalize(normal.length ? normal : data),
        mirage: normalize(mirage),
      }), {
        status: 200,
        headers: {
          "Content-Type":                "application/json",
          "Cache-Control":               "public, s-maxage=240, stale-while-revalidate=60",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    throw new Error("Format de réponse inattendu : " + JSON.stringify(data).slice(0, 100));

  } catch (err) {
    console.error("[/api/stock] Erreur:", err.message);

    return new Response(JSON.stringify(FALLBACK), {
      status: 200,
      headers: {
        "Content-Type":                "application/json",
        "Cache-Control":               "public, s-maxage=60",
        "Access-Control-Allow-Origin": "*",
        "X-Stock-Source":              "fallback",
      },
    });
  }
}
 
