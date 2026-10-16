---
name: agent-dev-standards
description: Skill principal qui pilote un ensemble de skills spécialisés (workflow-dev, securite-dev, qualite-code, tests-dev, documentation-dev, performance-dev, projet-existant, nouveau-projet, livraison-dev) pour toute tâche de développement confiée à un agent IA. À consulter en premier dès qu'une tâche implique d'écrire, modifier, revoir ou livrer du code — création d'API, gestion d'entrées utilisateur, authentification, base de données, upload de fichiers, nouveau projet, refactoring, CI/CD, Docker — même si l'utilisateur ne mentionne pas explicitement "sécurité", "qualité" ou "plan". Ce skill indique quels skills spécialisés mobiliser selon la nature de la tâche ; il ne contient pas lui-même les règles détaillées.
---

# Agent Principal — orchestration des standards de développement

Ce skill est le point d'entrée. Il ne contient pas de règles détaillées : il indique **quels skills spécialisés consulter** selon la tâche, et dans quel ordre. Les règles elles-mêmes vivent dans chaque skill dédié, à charge pour chacun de rester utilisable seul (ex. l'utilisateur demande une revue de sécurité isolée → `securite-dev` seul suffit).

## Skills de la suite

| Skill | Responsabilité unique |
|---|---|
| `workflow-dev` | Piloter le déroulement : analyse de la demande, exploration de l'existant, plan, validation utilisateur, exécution |
| `securite-dev` | Validation des entrées, injections, secrets, auth, uploads, rate limiting, en-têtes de sécurité |
| `qualite-code` | Lisibilité, SOLID/SRP/DRY, typage, architecture, gestion des erreurs, observabilité |
| `tests-dev` | Tests unitaires/intégration, cas limites, tests de sécurité, couverture |
| `documentation-dev` | README, OpenAPI, changelog, documentation de configuration |
| `performance-dev` | N+1, index, pagination, cache, complexité algorithmique |
| `projet-existant` | Conventions existantes, rétrocompatibilité, migrations DB, ne pas casser l'API |
| `nouveau-projet` | Architecture initiale, arborescence, Docker, CI/CD, choix techniques |
| `livraison-dev` | Résumé fichier par fichier, checklist finale, acceptation/rejet utilisateur |

## Grille de mobilisation

Toujours mobiliser, quelle que soit la tâche :
- `workflow-dev` en tout début de tâche (jamais d'exécution directe sans passer par cette étape) ;
- `livraison-dev` en toute fin de tâche.

Mobiliser en fonction du contexte détecté :

| Signal dans la demande | Skill(s) à mobiliser en plus |
|---|---|
| Toute écriture/modification de code, quel que soit le sujet | `qualite-code` |
| Logique non triviale ajoutée ou modifiée | `tests-dev` |
| Entrée utilisateur, API, authentification, upload, DB, appel réseau externe | `securite-dev` |
| Requêtes en base, boucles sur des collections, endpoints retournant des listes | `performance-dev` |
| README/API/CHANGELOG/config impactés, ou nouvelle fonctionnalité publique | `documentation-dev` |
| Base de code déjà existante (le projet n'est pas créé de zéro) | `projet-existant` |
| Création d'un projet, d'un service ou d'un module de zéro | `nouveau-projet` |

Une tâche mobilise généralement `workflow-dev` + `qualite-code` + `livraison-dev` au minimum, et 2 à 4 skills additionnels selon le contexte. Ne pas mobiliser un skill hors sujet (ex. `nouveau-projet` sur un simple fix dans un projet existant).

## Si un skill de la suite n'est pas disponible

Si l'un des skills listés n'apparaît pas dans les skills disponibles (installation partielle), appliquer directement les bonnes pratiques standard du domaine concerné plutôt que de bloquer la tâche, et le signaler brièvement à l'utilisateur (ex. "le skill tests-dev n'est pas installé, j'applique les bonnes pratiques de test standard").

## Enchaînement type

1. `workflow-dev` : comprendre la demande, explorer l'existant si besoin, proposer un plan (léger ou détaillé), le faire valider.
2. Selon le plan validé : `projet-existant` ou `nouveau-projet` pour le cadrage structurel, puis implémentation guidée par `securite-dev`, `qualite-code`, `performance-dev`.
3. `tests-dev` pour couvrir le code produit.
4. `documentation-dev` si des éléments documentés sont impactés.
5. `livraison-dev` pour le résumé, la checklist finale et l'acceptation utilisateur.
