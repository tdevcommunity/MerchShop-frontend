# MerchShop Frontend — TDEV Festival 2026

Interface web du shop Merch officiel du **TDEV Festival 2026** :
catalogue, panier, tunnel d'achat (checkout), page de confirmation avec QR Code,
responsive et mobile-first.

Stack : **Next.js 16 (App Router)**, React 19, TypeScript, Tailwind CSS v4.

L'architecture et les règles de contribution sont dans
[`docs/FRONTEND_ARCHITECTURE.md`](./docs/FRONTEND_ARCHITECTURE.md).

---

## Démarrage

```bash
cp .env.example .env.local
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Sans `NEXT_PUBLIC_API_BASE_URL`, le Shop tourne sur des **mocks locaux**.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

---

## Équipe & docs

- ⭐ [`CONTRIBUTING.md`](./CONTRIBUTING.md) — **règles de branches Git, flux de travail, conventions de commits** — à lire avant toute action
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) — code de conduite de l'équipe
- [`docs/NAMING_CONVENTIONS.md`](./docs/NAMING_CONVENTIONS.md) — conventions de nommage (branches, commits, fichiers, code, API, BDD, env)
- [`docs/CHANTIER-2-SHOP-MERCH.md`](./docs/CHANTIER-2-SHOP-MERCH.md) — spécifications opérationnelles du Chantier 2
- [`docs/CODE_STANDARDS.md`](./docs/CODE_STANDARDS.md) — standards de qualité du code
- [`docs/FRONTEND_ARCHITECTURE.md`](./docs/FRONTEND_ARCHITECTURE.md) — architecture frontend
- [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) — modèle de Pull Request

---

## Flux Git

```bash
git checkout develop && git pull origin develop
git checkout -b feat/<ma-tache>
# ...
git push -u origin feat/<ma-tache>
# Pull Request vers develop
```

Le détail complet est dans [`CONTRIBUTING.md`](./CONTRIBUTING.md).
