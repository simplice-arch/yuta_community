/**
 * /api/stock.js — Vercel Serverless Function
 *
 * Scrape direct de RBX Planet — 100% GRATUIT, aucune clé API requise.
 * Retourne : { normal: [...], mirage: [...] }
 */

export const config = { runtime: "edge" };

const FALLBACK = {
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

/**
 * Parse le prix depuis les formats RBX Planet :
 * "$1,800,000" → 1800000  |  "$5,000" → 5000
 */
function parsePrice(str) {
  if (!str) return 0;
  return parseInt(str.replace(/[$,\s]/g, ""), 10) || 0;
}

/**
 * Extrait les fruits d'un bloc HTML (Normal ou Mirage)
 * Structure RBX Planet :
 *   <h3>NomFruit</h3>
 *   <p>Type</p>
 *   <p>$prix R robux</p>
 */
function parseFruitsBlock(html) {
  const fruits = [];
  // Chaque fruit est entouré d'un bloc avec h3 (nom) + paragraphes (type, prix)
  const fruitRegex = /<h3[^>]*>\s*([\w\s\-]+?)\s*<\/h3>[\s\S]*?<p[^>]*>\s*(Natural|Elemental|Beast)\s*<\/p>[\s\S]*?<p[^>]*>\s*(\$[\d,]+)/gi;

  let match;
  while ((match = fruitRegex.exec(html)) !== null) {
    const name = match[1].trim();
    const type = match[2].trim();
    const beli = parsePrice(match[3]);
    if (name && beli > 0) {
      fruits.push({ name, beli, type });
    }
  }
  return fruits;
}

export default async function handler(req) {
  try {
    const res = await fetch("https://rbxplanet.com/game/blox-fruits/stock", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; YutaBloxTracker/1.0)",
        "Accept":     "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) throw new Error("RBX Planet HTTP " + res.status);

    const html = await res.text();

    // Délimiter les sections Normal et Mirage
    const normalStart = html.indexOf("Normal Stock");
    const mirageStart = html.indexOf("Mirage Stock");

    if (normalStart < 0) throw new Error("Section 'Normal Stock' introuvable");

    const normalHtml = mirageStart > normalStart
      ? html.slice(normalStart, mirageStart)
      : html.slice(normalStart);

    const mirageHtml = mirageStart > 0
      ? html.slice(mirageStart, mirageStart + 6000)
      : "";

    const normal = parseFruitsBlock(normalHtml);
    const mirage = parseFruitsBlock(mirageHtml);

    // Si le parsing renvoie trop peu de résultats, quelque chose a changé → fallback
    if (normal.length === 0) throw new Error("Aucun fruit parsé dans Normal Stock");

    return new Response(JSON.stringify({ normal, mirage }), {
      status: 200,
      headers: {
        "Content-Type":                "application/json",
        "Cache-Control":               "public, s-maxage=240, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    console.error("[/api/stock] Erreur scraping:", err.message);

    // Fallback : dernier stock connu codé en dur
    return new Response(JSON.stringify(FALLBACK), {
      status: 200,
      headers: {
        "Content-Type":                "application/json",
        "Cache-Control":               "public, s-maxage=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
