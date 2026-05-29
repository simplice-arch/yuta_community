# 🍑 YUTA BLOX COMMUNITY — Stock Tracker

Site de tracking de stock live pour Blox Fruits.
**100% GRATUIT — Aucune clé API requise.**

## Stack
- **Frontend** : HTML / CSS / JS vanilla (dossier `public/`)
- **Backend**  : Vercel Serverless Functions (dossier `api/`)
- **Données**  : Scraping direct de RBX Planet (gratuit)
- **Assistant**: Base de connaissance intégrée (gratuit)

---

## 🚀 Déploiement sur Vercel (étape par étape)

### 1. Créer un compte Vercel
→ https://vercel.com/signup (connexion avec GitHub recommandée)

### 2. Mettre le projet sur GitHub
```bash
# Dans le dossier yuta-blox/ :
git init
git add .
git commit -m "Initial commit — YUTA BLOX COMMUNITY"

# Créer un repo sur https://github.com/new (nom : yuta-blox)
# Puis lier et pousser :
git remote add origin https://github.com/TON_USERNAME/yuta-blox.git
git branch -M main
git push -u origin main
```

### 3. Importer sur Vercel
1. Va sur https://vercel.com/new
2. Clique **"Import Git Repository"**
3. Sélectionne ton repo `yuta-blox`
4. Laisse les paramètres par défaut (Vercel détecte `vercel.json`)
5. Clique **Deploy** — ton site sera en ligne en ~30 secondes 🎉

> ✅ Pas de variable d'environnement à configurer — c'est tout !

---

## 📁 Structure du projet
```
yuta-blox/
├── public/
│   ├── index.html   ← Page principale
│   ├── style.css    ← Design dark gaming
│   └── app.js       ← Timer, grille, assistant IA
├── api/
│   ├── stock.js     ← Route GET /api/stock (scrape RBX Planet)
│   └── ask.js       ← Route POST /api/ask (assistant intégré)
├── vercel.json      ← Config routing Vercel
└── README.md
```

---

## 🔄 Comment ça marche

1. L'utilisateur charge la page → `app.js` appelle `GET /api/stock`
2. La fonction serverless scrape directement `rbxplanet.com/game/blox-fruits/stock`
3. Le HTML est parsé pour extraire les fruits en stock (Normal + Mirage)
4. Le JSON est affiché dans la grille avec le timer de restock
5. Le stock est mis en cache 4 minutes côté Vercel Edge (zéro requête inutile)

---

## 🛠 Développement local

```bash
# Installer Vercel CLI
npm install -g vercel

# Dans le dossier yuta-blox/ :
vercel dev
# → Lance le site sur http://localhost:3000
```

---

## ❓ FAQ

**Ça coûte quelque chose ?**
→ Non, absolument rien. Vercel (plan Hobby) et RBX Planet sont gratuits.

**Le stock est-il vraiment live ?**
→ Oui, le site scrape RBX Planet à chaque chargement. RBX Planet synchronise depuis le jeu toutes les ~5 min.

**L'assistant IA répond à quoi ?**
→ Il répond aux questions sur le PvP, le farm, les prix, les raids, les trades — basé sur une base de connaissance intégrée.

**Le site se met à jour automatiquement ?**
→ Oui, toutes les 4 minutes en arrière-plan, et à chaque clic sur "Actualiser".
