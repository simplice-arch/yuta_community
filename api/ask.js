/**
 * /api/ask.js — Vercel Serverless Function
 *
 * Assistant IA Blox Fruits — VERSION GRATUITE
 * Répond avec des conseils pré-programmés, sans aucune API payante.
 *
 * Reçoit : { question, normalStock, mirageStock }
 * Retourne : { answer }
 */

export const config = { runtime: "edge" };

// Base de connaissance Blox Fruits
const KNOWLEDGE = {
  // Fruits par tier PvP
  pvp_tier: {
    S: ["Leopard", "Dragon", "Control", "Dough", "Venom"],
    A: ["Rumble", "Blizzard", "Phoenix", "Paw", "Mammoth"],
    B: ["Quake", "Ghost", "Gravity", "Sound", "Magma"],
    C: ["Dark", "Light", "Sand", "Ice", "Flame"],
    D: ["Rubber", "Diamond", "Spider", "Smoke", "Blade"],
  },
  // Prix en Beli
  prices: {
    Rocket: 5000, Spin: 7500, Chop: 30000, Spring: 60000,
    Bomb: 80000, Blade: 30000, Smoke: 100000, Spike: 180000,
    Flame: 250000, Ice: 350000, Sand: 420000, Dark: 500000,
    Diamond: 600000, Light: 650000, Rubber: 750000, Ghost: 940000,
    Magma: 850000, Quake: 1000000, Sound: 1700000, Phoenix: 1800000,
    Paw: 2300000, Rumble: 2100000, Spider: 1500000, Gravity: 2500000,
    Blizzard: 2500000, Dough: 2800000, Mammoth: 2700000, Control: 3000000,
    Venom: 3000000, Dragon: 3500000, Leopard: 5000000,
  },
  // Meilleurs fruits pour chaque usage
  best_for: {
    pvp:    ["Leopard", "Dragon", "Control", "Dough", "Venom", "Rumble"],
    farm:   ["Magma", "Light", "Flame", "Sand", "Dark", "Quake"],
    raid:   ["Phoenix", "Control", "Quake", "Rumble", "Dragon"],
    sea:    ["Light", "Sand", "Magma", "Dough", "Leopard"],
    boss:   ["Magma", "Quake", "Dragon", "Control", "Light"],
    fruit:  ["Dragon", "Dough", "Leopard", "Control", "Rumble"],
  },
};

function getTierOfFruit(name) {
  for (const [tier, fruits] of Object.entries(KNOWLEDGE.pvp_tier)) {
    if (fruits.includes(name)) return tier;
  }
  return "D";
}

function getBestInStock(stockList, category) {
  const best = KNOWLEDGE.best_for[category] || [];
  const inStock = stockList.filter(f => best.includes(f));
  return inStock.length > 0 ? inStock : stockList.slice(0, 3);
}

function generateAnswer(question, normalStock, mirageStock) {
  const q = question.toLowerCase();
  const allStock = [...new Set([...normalStock, ...mirageStock])];

  // ─── VALEUR DU STOCK ───
  if (q.includes("vaut") || q.includes("acheter") || q.includes("recommande") || q.includes("coup")) {
    const pvpBest = getBestInStock(normalStock, "pvp");
    if (pvpBest.length > 0) {
      const top = pvpBest[0];
      const tier = getTierOfFruit(top);
      return `Le meilleur fruit en stock Normal en ce moment est **${top}** (Tier ${tier} PvP). ${
        tier === "S" ? "C'est un fruit top tier, achète-le sans hésiter !" :
        tier === "A" ? "C'est un très bon fruit, excellent rapport qualité/prix." :
        "Il est correct mais attends un meilleur restock si tu peux."
      } Les autres fruits intéressants en stock : ${pvpBest.slice(1).join(", ") || "aucun autre notable ce cycle"}.`;
    }
    return `Le stock actuel (${normalStock.join(", ")}) ne contient pas de fruit top tier. Je te conseille d'attendre le prochain restock dans quelques heures.`;
  }

  // ─── PvP ───
  if (q.includes("pvp") || q.includes("combat") || q.includes("fight") || q.includes("meilleur fruit")) {
    const best = getBestInStock(allStock, "pvp");
    const tierList = KNOWLEDGE.pvp_tier.S.concat(KNOWLEDGE.pvp_tier.A);
    const topTier = tierList.filter(f => allStock.includes(f));
    if (topTier.length > 0) {
      return `Pour le PvP, le meilleur choix en stock actuellement est **${topTier[0]}**. Tier list global : S (${KNOWLEDGE.pvp_tier.S.join(", ")}), A (${KNOWLEDGE.pvp_tier.A.join(", ")}). ${topTier[0] === "Leopard" ? "Leopard est le fruit PvP ultime du jeu !" : topTier[0] === "Dragon" ? "Dragon est extrêmement puissant en PvP avec ses transformations." : "C'est un excellent choix !"}`;
    }
    return `Aucun fruit top PvP en stock ce cycle. Les meilleurs fruits PvP du jeu sont : ${KNOWLEDGE.pvp_tier.S.join(", ")}. Reviens au prochain restock !`;
  }

  // ─── FARM ───
  if (q.includes("farm") || q.includes("xp") || q.includes("level") || q.includes("grind")) {
    const best = getBestInStock(allStock, "farm");
    return `Pour le farm/grind, les meilleurs fruits en stock sont : **${best.slice(0,2).join(", ") || allStock[0]}**. En général, Magma, Light et Flame sont les rois du farm grâce à leur zone d'effet. Magma brûle tout autour de toi sans effort !`;
  }

  // ─── RAID ───
  if (q.includes("raid")) {
    const best = getBestInStock(allStock, "raid");
    return `Pour les raids, **${best[0] || allStock[0]}** est ton meilleur choix en stock. Phoenix est idéal car il permet de soigner les alliés. Control et Quake ont d'excellentes AoE pour nettoyer les vagues rapidement.`;
  }

  // ─── PRIX ───
  if (q.includes("prix") || q.includes("combien") || q.includes("beli") || q.includes("coûte")) {
    const priceList = normalStock
      .map(f => `${f}: ${KNOWLEDGE.prices[f] ? (KNOWLEDGE.prices[f] / 1000) + "K" : "?"} Beli`)
      .join(" | ");
    return `Prix du stock Normal actuel → ${priceList}. Le plus cher en stock : ${
      normalStock.sort((a,b) => (KNOWLEDGE.prices[b]||0) - (KNOWLEDGE.prices[a]||0))[0]
    }. Rappel : les fruits mythiques (Dragon, Leopard...) peuvent coûter jusqu'à 5M Beli !`;
  }

  // ─── LEOPARD ───
  if (q.includes("leopard")) {
    const inStock = allStock.includes("Leopard");
    return inStock
      ? "🔥 **Leopard est en stock !** C'est le fruit le plus puissant du jeu en PvP. Si tu as les Beli (5M), achète-le immédiatement — il ne reste jamais longtemps !"
      : "Leopard n'est pas en stock ce cycle. C'est le fruit Tier S ultime (5M Beli). Mets un rappel pour le prochain restock, il part très vite !";
  }

  // ─── DRAGON ───
  if (q.includes("dragon")) {
    const inStock = allStock.includes("Dragon");
    return inStock
      ? "🐉 **Dragon est en stock !** C'est un fruit Tier S, excellent en PvP et en farm. À 3.5M Beli c'est un investissement qui vaut vraiment le coup."
      : "Dragon n'est pas en stock ce cycle. C'est un fruit Tier S (3.5M Beli), l'un des meilleurs du jeu. Reviens au prochain restock !";
  }

  // ─── MIRAGE ───
  if (q.includes("mirage")) {
    return mirageStock.length > 0
      ? `Le Stock Mirage se restock toutes les 2h (deux fois plus souvent que le Normal). Fruits disponibles en Mirage : **${mirageStock.join(", ")}**. C'est une bonne source pour les fruits rares si tu rates le Normal !`
      : "Le Stock Mirage est vide ou non disponible ce cycle. Réessaie dans 2h !";
  }

  // ─── RESTOCK ───
  if (q.includes("restock") || q.includes("quand") || q.includes("heure")) {
    return "Le Fruit Dealer (Normal) se restock toutes les **4 heures** aux heures fixes UTC : 00h, 04h, 08h, 12h, 16h, 20h. Le Stock Mirage se restock toutes les **2 heures**. Le timer en haut de la page te montre exactement le temps restant !";
  }

  // ─── TRADE / VALEUR ───
  if (q.includes("trade") || q.includes("vendre") || q.includes("valeur")) {
    const topStock = normalStock.sort((a,b) => (KNOWLEDGE.prices[b]||0) - (KNOWLEDGE.prices[a]||0));
    return `En trade, la valeur d'un fruit dépend de sa rareté et de sa demande PvP. Ton fruit le plus valuable en stock : **${topStock[0]}**. Les fruits les plus recherchés en trade sont : Leopard, Dragon, Dough, Control, Venom. Utilise les serveurs Discord de trading pour obtenir des offres justes !`;
  }

  // ─── DÉBUTANT ───
  if (q.includes("débutant") || q.includes("commencer") || q.includes("débuter") || q.includes("nouveau")) {
    return `Pour commencer Blox Fruits, voici les priorités : 1️⃣ Farm avec Flame ou Ice (abordables, bonnes AoE). 2️⃣ Complète les quêtes pour monter de level. 3️⃣ Vise le 3ème Sea le plus vite possible. 4️⃣ Économise pour un fruit Legendary+. Fruits accessibles en stock actuellement : ${normalStock.slice(0,3).join(", ")}.`;
  }

  // ─── RÉPONSE GÉNÉRIQUE ───
  const stockNormal = normalStock.length > 0 ? normalStock.join(", ") : "aucun ce cycle";
  const stockMirage = mirageStock.length > 0 ? mirageStock.join(", ") : "aucun ce cycle";
  return `Stock actuel → Normal: **${stockNormal}** | Mirage: **${stockMirage}**. Tu peux me poser des questions sur : le PvP, le farm, les raids, les prix, les trades, ou me demander quel fruit acheter parmi ceux en stock !`;
}

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { question, normalStock, mirageStock } = await req.json();

    if (!question?.trim()) {
      return new Response(JSON.stringify({ answer: "Question vide." }), { status: 400 });
    }

    const normalList = normalStock ? normalStock.split(", ").filter(Boolean) : [];
    const mirageList = mirageStock ? mirageStock.split(", ").filter(Boolean) : [];

    const answer = generateAnswer(question, normalList, mirageList);

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[/api/ask] Erreur:", err.message);
    return new Response(
      JSON.stringify({ answer: "Une erreur s'est produite. Réessaie !" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
