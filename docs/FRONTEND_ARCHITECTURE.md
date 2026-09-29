# Architecture frontend — Merch Shop TDEV

Document de référence pour contribuer au frontend du Shop Merch TDEV Festival 2026.

La stack : **Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind CSS v4**.

---

## 1. Architecture générale

```text
Interface (app/, components/)
        ↓
Features métier (features/*)
        ↓
Validation / état UX (lib/validation, features/cart/store)
        ↓
Services domaine (features/*/services)
        ↓
Client API (lib/api)
        ↓
Backend indépendant
```

Règle : **jamais** d’appel `fetch` dans un composant UI générique, ni de règle métier dans le JSX au-delà de l’affichage.

Le frontend n’est **pas** source de vérité pour les prix, stocks, montants de paiement ou validité du QR. Le backend recalcule et valide. Le Chantier 3B (scan) valide le pass de retrait côté serveur.

---

## 2. Rôle des dossiers

| Chemin | Rôle |
|---|---|
| `src/app/` | Routes, layouts, `loading` / `error` / `not-found`, metadata |
| `src/components/ui/` | Primitives visuelles (Button, Input…) — **sans** métier Shop |
| `src/components/layout/` | Header, footer, shell |
| `src/components/shared/` | Empty / error states réutilisables |
| `src/features/<domaine>/` | Composants, hooks, services, store **spécifiques** au domaine |
| `src/lib/api/` | Client HTTP, erreurs, endpoints |
| `src/lib/config/` | Env public, constantes de site |
| `src/lib/validation/` | Règles de formulaires (UX, pas sécurité) |
| `src/lib/seo/` | Fabrique de metadata |
| `src/lib/utils/` | Helpers purs (`cn`, `formatMoney`) |
| `src/types/` | Contrats frontend **provisoires** à aligner avec le backend |
| `e2e/` | Scénarios Playwright |

### Domaines métier (`src/features/`)

- `catalog` — liste produits, mocks, grille
- `product` — fiche et sélecteur de variantes
- `cart` — store UX, totaux indicatifs, ajout / retrait
- `checkout` — workflow coordonnées → réception → récap → paiement
- `order` — détail / confirmation de commande
- `payment` — statuts de paiement (pending, success, failed…)
- `qr` — affichage du QR fourni par le backend
- `analytics` — `track(event)` sans provider (point d’intégration)

---

## 3. Routes

| URL | Intention |
|---|---|
| `/` | Accueil |
| `/shop` | Catalogue |
| `/shop/[slug]` | Fiche produit |
| `/cart` | Panier |
| `/checkout` | Tunnel d’achat |
| `/checkout/confirmation?orderId=` | Confirmation post-paiement |
| `/order/[id]` | Détail commande + QR |

---

## 4. Server vs Client Components

**Par défaut : Server Components.**

`"use client"` uniquement pour :

- panier (`useCart`, header compteur, bouton ajouter)
- sélecteur de variantes
- formulaires checkout
- chargement d’une commande mockée en session (en attendant l’API)

Documenter le choix dans le fichier si un composant client semble « trop large » : extraire le sous-arbre interactif plutôt que de clientiser toute la page.

---

## 5. État

### Serveur

Produits, stocks, commandes, paiement, QR → services + API.

### Client

- Panier : `features/cart/store/cart-store.ts` (`localStorage`, `useSyncExternalStore`)
- Draft checkout : state local du formulaire
- Cache mock commande : `sessionStorage` (uniquement sans backend)

Les totaux panier sont **indicatifs**. Le checkout envoie `productId`, `variantId`, `quantity` — pas un montant opposable.

---

## 6. Communication API

1. UI appelle un **service de feature** (`listProducts`, `createCheckoutSession`, `getPickupQr`…).
2. Le service utilise `apiRequest` (`src/lib/api/client.ts`) vers `NEXT_PUBLIC_API_BASE_URL` + `src/lib/api/endpoints.ts`.
3. Les erreurs passent par `src/lib/api/errors.ts` puis `toUserMessage()`.

Si `NEXT_PUBLIC_API_BASE_URL` est vide, les services basculent sur des **mocks locaux** pour que `npm run dev` fonctionne sans backend.

Endpoints prévus (convention REST du repo) :

- `GET /api/v1/products`
- `GET /api/v1/products/{slug}`
- `POST /api/v1/checkout`
- `GET /api/v1/orders/{id}`
- `GET /api/v1/orders/{id}/pickup-qr`

Les noms de champs JSON sont en `camelCase`, comme dans `docs/NAMING_CONVENTIONS.md`. Ils restent provisoires jusqu’au contrat backend.

---

## 7. QR et Chantier 3B

Le Shop **affiche** un QR (URL ou data URL) renvoyé par le backend, encodant côté serveur `Order_ID` + hash.

Le frontend :

- ne génère pas le hash ;
- ne valide pas le QR ;
- n’embarque aucun secret.

L’app mobile de scan parle du **même `order.id`** que le Shop.

---

## 8. Design tokens

Charte TDEV dans `src/app/globals.css` (`@theme`) :

- couleurs `tdev-*` (black, anthracite, white, blue, yellow, orange, green, violet, cyan, pink)
- polices : `--font-headline` (Stack Sans Headline) et `--font-notch` (Stack Sans Notch), avec fallback système tant que les fichiers de fonte ne sont pas livrés
- radius, ombre carte, breakpoints

Usage Tailwind : `bg-tdev-yellow`, `text-tdev-black`, `font-headline`, etc.

Mobile-first : styles de base = smartphone, `sm:` / `lg:` ensuite. Cibles tactiles ≥ 44px (`min-h-11`).

---

## 9. Environnements

Voir `.env.example`.

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | `development` / `test` / `production` |
| `NEXT_PUBLIC_SITE_URL` | Canonical / Open Graph |
| `NEXT_PUBLIC_API_BASE_URL` | API backend ; vide = mocks |

Aucun secret (clés paiement, JWT privé) n’a sa place en `NEXT_PUBLIC_*`.

---

## 10. Tests

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e   # Playwright — npm exec playwright install chromium au besoin
```

- **Unitaires (Vitest)** : totaux panier, store, validation checkout, erreurs API, statuts paiement, formatage.
- **E2E** : accueil → catalogue → produit → panier.

Le paiement réel n’est jamais utilisé dans les tests.

---

## 11. Scripts npm

| Script | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm start` | Servir le build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm test` | Vitest (CI) |
| `npm run test:watch` | Vitest watch |
| `npm run test:e2e` | Playwright |

---

## 12. Ajouter une feature

1. Créer `src/features/<domaine>/` (services d’abord, puis composants).
2. Typer le contrat dans `src/types/` s’il est partagé, sinon localement.
3. Ajouter un endpoint dans `lib/api/endpoints.ts` — pas de `fetch` dans l’UI.
4. Brancher une route dans `src/app/` **mince** (page = composition).
5. Prévoir loading / empty / error.
6. Appeler `track(...)` aux événements métier (voir `features/analytics/events.ts`).
7. Tests unitaires de la logique pure.
8. Commits Conventional Commits en français, branche `feat/<tache>` depuis `develop` — voir `CONTRIBUTING.md`.

Ne pas ajouter de dépendance sans justification dans la PR.

---

## 13. Décisions structurantes

| Décision | Pourquoi |
|---|---|
| Pas de Zustand / Redux | Un store panier vanilla + `useSyncExternalStore` suffit |
| Pas de Zod pour l’instant | Validation checkout simple, remplaçable plus tard |
| Pas de lib QR | Le backend fournit l’image ; le front l’affiche |
| Mocks si API vide | Le Shop démarre sans backend |
| Types provisoires dans `src/types/` | Évite d’inventer un modèle BDD définitif |
