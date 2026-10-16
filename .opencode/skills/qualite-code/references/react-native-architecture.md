# Architecture — React Native

## Organisation par feature

- Structurer par domaine fonctionnel plutôt que par type technique quand l'app grossit (`features/orders/`, `features/auth/`) : chaque feature regroupe ses écrans, composants, hooks et appels API dédiés.

## Séparation logique / présentation

- Logique métier et gestion d'état extraites dans des **hooks custom** (`useOrders()`) ou un store dédié (Zustand, Redux Toolkit, ou Context + reducer selon la complexité) — les composants restent centrés sur le rendu et l'interaction.
- Accès réseau centralisé dans une couche `api/`/`services/` dédiée (client HTTP configuré une fois, intercepteurs pour l'auth), jamais un `fetch` dispersé directement dans les composants d'écran.
- Navigation (React Navigation) configurée dans un module dédié (`navigation/`), pas mélangée à la logique métier des écrans.

## État global vs local

- Réserver l'état global (store) aux données réellement partagées entre plusieurs écrans (session utilisateur, panier) ; garder l'état purement local à un écran dans `useState`/`useReducer` du composant concerné, pour éviter un store surchargé et des re-renders inutiles.

## Principe commun avec le reste de la stack

Même logique que pour Vue/Next/Angular (voir `clean-architecture-frontend.md`) et BLoC pour Flutter (voir `bloc-flutter.md`) : le composant d'écran orchestre l'affichage, la logique métier et l'accès réseau vivent dans une couche dédiée et testable indépendamment du rendu (voir `tests-dev`).
