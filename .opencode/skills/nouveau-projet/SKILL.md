---
name: nouveau-projet
description: Règles à appliquer par un agent IA lorsqu'il crée un projet, service ou module de zéro — architecture et arborescence, justification systématique des choix techniques (framework, base de données, cache, message broker), CI/CD, Docker, conventions de code et de dépendances. À utiliser systématiquement dès qu'une tâche consiste à démarrer un nouveau projet plutôt qu'à modifier un projet existant (dans ce dernier cas, voir plutôt projet-existant). Se combine avec documentation-dev pour le contenu détaillé du README et securite-dev/performance-dev/qualite-code pour le code produit une fois l'architecture posée.
---

# Démarrer un projet de zéro

Ces règles complètent le plan de travail (voir `workflow-dev`, toujours en mode détaillé pour un nouveau projet).

## Architecture et structure

- Proposer une structure de dossiers claire et standard pour l'écosystème choisi (ex. séparation `src/`, `tests/`, `config/`, couches domaine/infrastructure/API si pertinent).
- Séparer explicitement : logique métier, accès aux données, couche API/présentation, configuration.
- Prévoir dès le départ l'emplacement des tests, de la documentation, des scripts d'exploitation (migrations, seed, etc.).

## Justification systématique des choix techniques

Pour chaque choix structurant (framework, base de données, cache, message broker, langage secondaire, outil de build...), fournir une justification courte avant de l'appliquer :
- pourquoi ce choix plutôt qu'une alternative raisonnable (au moins une alternative citée) ;
- critères pris en compte : besoins du projet (volumétrie, cohérence, latence), maturité/écosystème, courbe d'apprentissage, contraintes déjà exprimées par l'utilisateur.
- Exemple de formulation attendue : "PostgreSQL plutôt que MongoDB car les données sont fortement relationnelles et la cohérence transactionnelle est importante ici ; Redis en cache pour les sessions car accès très fréquent en lecture avec TTL naturel."
- Ne jamais imposer un choix sans alternative mentionnée quand plusieurs options sont réellement viables — laisser l'utilisateur trancher si les options sont proches.

## CI/CD

- Proposer un pipeline minimal : lint, tests, build, (déploiement si demandé), déclenché au moins sur les pull requests/merge vers la branche principale.
- Faire échouer le pipeline sur : échec de lint, échec de tests, vulnérabilités critiques connues dans les dépendances si un outil d'audit est disponible.
- Ne jamais inclure de secret en clair dans un fichier de CI — passer par les mécanismes de secrets de la plateforme (GitHub Actions secrets, GitLab CI variables, etc.).

## Docker

- Fournir un `Dockerfile` multi-stage quand pertinent (build séparé de l'image finale) pour réduire la surface et la taille de l'image.
- Utiliser une image de base officielle et une version épinglée (pas de tag `latest`).
- Faire tourner le processus applicatif avec un utilisateur non-root dans le conteneur.
- Exposer uniquement les ports nécessaires ; ne jamais copier de fichier `.env`/secret dans l'image.
- Fournir un `docker-compose.yml` pour l'environnement de développement local si le projet a des dépendances externes (DB, cache, broker).

## Conventions de code et de dépendances

- Mettre en place dès le départ un linter et un formatter adaptés au langage (ex. `ruff`/`black` en Python, `eslint`/`prettier` en JS/TS) et les faire tourner en CI.
- Définir/documenter une convention de commit (ex. Conventional Commits) si l'utilisateur n'en a pas déjà une.
- Épingler les versions de dépendances dans un fichier de lock dès le premier commit.
- Documenter ces conventions dans le README ou un `CONTRIBUTING.md` court (voir `documentation-dev` pour le contenu détaillé du README).
- Créer dès l'initialisation le couple fichier d'environnement réel/exemple (`.env`/`.env.example` ou `application.properties`/`application.properties.example` pour Spring Boot) — voir `securite-dev` pour la règle complète.

---

## Référence scaffolding par stack

`references/scaffolding-per-stack.md` — structure de dossiers recommandée et image Docker de base pour Laravel, DRF, Spring Boot, Vue/Next/Angular, Flutter/React Native.

Une fois l'architecture posée et validée, l'implémentation elle-même suit `securite-dev`, `qualite-code` et `performance-dev` comme pour tout code.
