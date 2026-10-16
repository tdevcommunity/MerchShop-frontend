# Architecture — Vue.js / Next.js / Angular

## Vue.js

- Organisation par feature/domaine plutôt que par type technique quand l'app grossit (`features/orders/`, `features/auth/`, plutôt qu'un unique `components/` fourre-tout).
- Logique métier/état extraite dans des **composables** (`useOrders.ts`) ou un store (Pinia) — les composants `.vue` restent centrés sur le template et l'appel aux composables, sans logique métier lourde inline dans le `<script setup>`.
- Accès réseau centralisé dans une couche `api/`/`services/` dédiée, jamais un `fetch`/`axios` dispersé directement dans les composants.

## Next.js

- Séparer clairement code serveur (Server Components, API routes, Server Actions) et code client (`"use client"`) — la logique métier sensible et les appels à des secrets restent côté serveur (voir `securite-dev`).
- Logique métier/accès aux données dans une couche dédiée (`lib/`, `services/`) appelée par les Server Components/Server Actions/API routes, plutôt qu'inline dans le fichier de route.
- Un composant client reste centré sur l'UI et l'interaction ; les transformations de données lourdes restent côté serveur.

## Angular

- Respecter la structure modulaire d'Angular : modules par feature, services (`@Injectable`) pour la logique métier et l'accès aux données, composants centrés sur le template et la liaison aux services.
- Les composants n'appellent jamais directement `HttpClient` — passer par un service dédié, injecté, qui centralise les appels API d'un domaine.
- Utiliser les interfaces/types TypeScript pour les modèles de données échangés avec le backend plutôt que des `any`.

## Principe commun

Dans les trois frameworks : les composants d'UI orchestrent l'affichage et l'interaction, jamais l'appel réseau brut ni la règle métier complexe — celle-ci vit dans une couche service/composable/lib dédiée et testable indépendamment du rendu (voir `tests-dev`).
