---
name: tdev-festival-standards
description: "Conventions de nommage, règles de développement (git, sécurité, tests, revue de code, Definition of Done) et spécification de tracking analytique du projet TDEV Festival (billetterie, Shop Merch, contrôle d'accès QR, Free Food, After). À utiliser systématiquement pour toute tâche de code sur ce projet — merch-shop-backend, merch-shop-frontend, application de scan, ou tout module lié à la billetterie/paiement/QR. Prime sur les conventions génériques d'autres skills en cas de conflit, puisqu'il s'agit des règles spécifiques validées par l'équipe pour ce projet précis."
---

# TDEV Festival — standards de développement

Document transversal et évolutif. Les règles précises (linters, framework, tests) seront finalisées une fois la stack technique validée par l'équipe. Les principes ci-dessous s'appliquent dès le premier commit, quelle que soit la techno retenue.

## 1. Fichiers & dossiers

- **kebab-case** (minuscules + tirets) pour tous les fichiers et dossiers : `product-card.tsx`, `cart-service.ts`, `api-specs.md`.
- Pas d'accents, pas de majuscules, pas d'espaces dans les noms de fichiers.
- Projets : `merch-shop-backend` / `merch-shop-frontend`.
- Dossiers de code : nom au singulier (`component/`, `service/`, `controller/`, `model/`) — à affiner avec la stack retenue.

Exemples :
```
docs/chantier-2-shop-merch.md
src/api/order.controller.ts
components/product-card.tsx
```

## 2. Code (variables, fonctions, composants)

Règles transverses ; la casse exacte des types sera confirmée avec le langage retenu (JS/TS, PHP...). Le principe reste le même partout.

| Élément | Convention | Exemple |
|---|---|---|
| Variables & fonctions | camelCase | `cartTotal`, `getProductById()` |
| Classes / Composants | PascalCase | `ProductCard`, `OrderService` |
| Constantes (config, limites) | UPPER_SNAKE_CASE | `MAX_QUANTITY`, `PAYMENT_STATUS` |
| Booléens | préfixe `is`/`has`/`can`/`should` | `isAvailable`, `hasVariant`, `canCheckout` |
| Private / local (si pertinent) | préfixe `_` ou selon le langage | `_internalHelper()` |

Nommer par ce que la variable/fonction fait ou contient, jamais par son type (`products` ✔, `arr1` ✘).

## 3. API (REST)

- Base : `/api/v1/<ressource>` — ressource au pluriel, kebab-case.
- Actions classiques : `GET /products`, `GET /products/{id}`, `POST /orders`, `POST /payments/webhook`.
- Pas de verbes dans les URLs (`getProducts` ✘ → `GET /products` ✔).
- Réponses JSON en camelCase (ex. `orderId`, `stockQuantity`).
- À finaliser avec la stack retenue.

## 4. Base de données

- Tables : snake_case au pluriel : `products`, `orders`, `order_items`, `product_variants`.
- Colonnes : snake_case : `stock_quantity`, `unit_price`, `payment_status`.
- Clés : `id` (PK), `<table>_id` (FK) : `order_id`, `product_id`.
- Les identifiants métier du plan de tracking (`participant_id`, `ticket_id`, `scan_id`, etc. — voir `references/data-tracking-plan.md`) suivent cette même convention snake_case et doivent rester cohérents entre billetterie, Shop et application de scan.
- À finaliser avec la stack retenue.

## 5. Variables d'environnement

- UPPER_SNAKE_CASE, préfixées par domaine pour éviter les collisions :
  - `DB_HOST`, `DB_PORT`, `DB_NAME`
  - `FEDAPAY_SECRET_KEY`, `FEDAPAY_SANDBOX`
  - `JWT_SECRET`, `APP_URL`
- Front : `NEXT_PUBLIC_*` ou `VITE_*` selon la stack (à confirmer).
- Jamais commitées — `.env` dans le `.gitignore`, un `.env.example` à jour et commité en contrepartie.

## 6. Principes généraux

- **Lisibilité avant astuce** : du code simple et explicite vaut mieux qu'un code "malin" illisible.
- **Nommage explicite** : variables, fonctions, fichiers et branches portent des noms qui décrivent leur rôle.
- **Une fonction = une responsabilité** : pas de fonctions "fourre-tout" de plusieurs centaines de lignes.
- **Pas de duplication** : factoriser ce qui est commun (composants, helpers, utilitaires), sans sur-architecturer.
- **Commentaires utiles** : expliquer le pourquoi (contexte métier, contrainte de paiement, sécurité), pas le quoi.

## 7. Git & commits

- Suivre les règles de `../CONTRIBUTING.md` : branches `feat/fix/chore`, PR vers `develop`, commits conventionnels.
- Un commit = un changement cohérent. Commiter souvent, avec des messages clairs.
- Ne jamais committer : fichiers de config locaux, secrets, clés, `.env`, logs, artefacts de build.

## 8. Sécurité (transverse)

- **Aucun secret en clair** : clés API, identifiants de paiement, chaînes de connexion BDD → uniquement par variables d'environnement, jamais dans le code.
- **Validation systématique des entrées utilisateur côté API** (montants, variantes, quantités) : le client n'est jamais une source de vérité.
- **Toute manipulation d'argent** (montants, statuts de paiement, remboursements) doit être validée/confirmée côté serveur via les webhooks sécurisés — jamais sur la seule foi d'une réponse client.
- **QR Code de retrait** : encodé avec `order_id` + hash de sécurité — jamais modifiable côté client. Voir `references/data-tracking-plan.md` pour la structure complète des QR (billetterie et Shop).
- Penser aux tests d'intrusion de Rachid : sanitiser, authentifier, limiter (rate limiting sur les endpoints sensibles — connexion, paiement, scan).

## 9. Tests

- Toute fonctionnalité livrée est accompagnée de tests (au minimum les scénarios critiques : panier, stock, paiement, QR).
- Cas critiques à couvrir en priorité :
  - Décrémentation du stock par variante (et sa concurrence — achats simultanés).
  - Cycle de vie d'une commande (création → paiement → confirmation → retrait).
  - Webhooks de paiement (validation et mise à jour du statut).
  - Impossibilité de modifier montant / commande côté client.
  - Scan d'un même QR à plusieurs points de contrôle (entrée, Food, After) : chaque scan doit être enregistré comme un événement distinct, jamais un simple remplacement d'état (voir `references/data-tracking-plan.md`, §7).
- Le QA de Rachid doit pouvoir recetter : prévoir des environnements Sandbox (paiement) et un environnement de staging.

## 10. Revue de code (Pull Request)

- Auto-review avant d'ouvrir la PR : relire son diff, nettoyer les oublis, mettre à jour sa branche sur `develop`.
- En PR, commenter de façon constructive et factuelle (voir Code de Conduite).
- La fusion en `develop` implique : checklist du template complétée, tests verts, pas de conflits.
- Le Lead Tech valide in fine les choix structurants.

## 11. Definition of Done (DoD) d'une tâche

Une tâche est achevée lorsque :
- Le code respecte les conventions de commits et le format des branches.
- La PR est décrite (contexte, choix, tests effectués) via le modèle de PR.
- La branche est à jour sur `develop` et sans conflit.
- Les tests nécessaires sont écrits et passent (fonctionnels ou manuels documentés).
- Aucun secret ni donnée sensible n'est exposé.
- La PR a été reviewée et approuvée (au minimum par un reviewer) avant fusion.

---

## Référence : plan de tracking & analytics

Pour toute tâche touchant à la billetterie, au Shop, au scan/contrôle d'accès, aux paiements ou à l'analytics, consulter `references/data-tracking-plan.md` : identifiants à conserver, modèle des QR Codes et droits, événements à tracker (scan, achat, navigation), règles de collecte (ne pas écraser l'historique, distinguer droit et usage), et priorités de collecte (P1/P2/P3).
