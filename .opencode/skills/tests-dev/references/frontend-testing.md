# Tests — Vue.js / Next.js / Angular

## Vue.js

- Vitest + Vue Test Utils pour les tests de composants (montage, assertions sur le rendu et les événements émis).
- Tester les composables isolément (fonctions pures/hooks) sans monter de composant quand la logique ne dépend pas du DOM.
- Mock des appels API (`vi.mock`) plutôt que des appels réseau réels dans les tests unitaires.

## Next.js

- Jest (ou Vitest) + React Testing Library pour les composants et hooks, en testant le comportement observable (ce que l'utilisateur voit/peut faire) plutôt que les détails d'implémentation internes.
- Pour les API routes/Server Actions : tests d'intégration dédiés simulant la requête et vérifiant la réponse, avec mock des dépendances externes (DB, API tierces).
- Playwright/Cypress pour les tests end-to-end sur les parcours critiques (authentification, paiement) si le projet le justifie.

## Angular

- Jasmine/Karma (par défaut Angular CLI) ou Jest si le projet l'a adopté — `TestBed` pour configurer le module de test d'un composant/service.
- Mock des services injectés via `TestBed.overrideProvider` ou des doubles simples, plutôt que d'appeler les vraies API dans un test unitaire.
- Tests de composant centrés sur le comportement rendu (interaction utilisateur, affichage conditionnel) plutôt que sur les détails internes du composant.
