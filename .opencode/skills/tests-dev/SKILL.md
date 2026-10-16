---
name: tests-dev
description: Définit les exigences de test pour le code écrit ou modifié par un agent IA — tests unitaires, tests d'intégration, couverture des cas limites et des cas d'erreur, tests de sécurité ciblés, couverture minimale attendue. À utiliser systématiquement dès qu'une tâche introduit ou modifie une logique non triviale, un endpoint, une fonction métier, ou un comportement lié à l'authentification/autorisation. S'utilise seul pour écrire ou revoir des tests sur du code déjà existant, ou combiné aux autres skills de la suite pour une tâche de développement complète.
---

# Tests

## Tests unitaires

- Toute nouvelle fonction avec logique non triviale doit être accompagnée (ou proposée accompagnée) de tests unitaires isolant la fonction de ses dépendances externes (mock/stub des appels réseau, DB, horloge, aléatoire).
- Couvrir au minimum : cas nominal, au moins un cas limite (borne min/max, collection vide, valeur nulle), au moins un cas d'erreur/entrée invalide.

## Tests d'intégration

- Pour les composants qui orchestrent plusieurs couches (endpoint API + validation + DB), ajouter au moins un test d'intégration qui exerce le chemin complet plutôt que de ne tester que les unités isolément.
- Utiliser un environnement de test dédié (DB de test, conteneur éphémère) — jamais de test d'intégration qui écrit sur une base de données de développement ou de production.

## Cas limites à systématiquement envisager

- Valeurs vides, nulles, ou au format inattendu.
- Bornes numériques (0, négatif, valeur maximale représentable).
- Collections vides ou à un seul élément.
- Concurrence (deux requêtes simultanées sur la même ressource) quand c'est pertinent (voir `qualite-code`).

## Tests de sécurité ciblés

Quand la fonction touche à un domaine sensible (voir `securite-dev`), ajouter des tests dédiés :
- entrée malveillante (injection, payload trop long, caractères d'échappement) rejetée proprement ;
- accès refusé pour un utilisateur non autorisé sur une ressource qui n'est pas la sienne (anti-IDOR) ;
- comportement correct en cas de dépassement du rate limiting, si applicable.

## Couverture minimale

- Le code métier et les endpoints exposés doivent avoir une couverture de test réelle, pas seulement des tests qui passent sans assertion significative.
- Ne pas viser un pourcentage de couverture comme objectif en soi : prioriser la couverture des chemins critiques (sécurité, paiement, données) même si le taux global reste modeste ailleurs.
- Signaler à l'utilisateur toute zone non testée par manque de temps/contrainte, plutôt que de le passer sous silence (voir `livraison-dev`).

## Hygiène des tests

- Ne pas committer de secrets dans les fixtures de test.
- Pour une modification de projet existant, s'assurer que les tests déjà présents continuent de passer — ne jamais désactiver un test existant pour "faire passer" une modification sans validation explicite de l'utilisateur (voir `projet-existant`).

---

## Références par stack

- `references/backend-testing.md` — PHPUnit/Pest (Laravel), pytest (DRF), JUnit/Mockito (Spring Boot)
- `references/frontend-testing.md` — Vitest/Vue Test Utils, Jest/RTL (Next.js), Jasmine/Karma ou Jest (Angular)
- `references/mobile-testing.md` — flutter_test/bloc_test (Flutter), Jest/RNTL/Detox (React Native)
