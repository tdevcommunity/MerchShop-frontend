---
name: projet-existant
description: Règles à appliquer par un agent IA lorsqu'il intervient sur une base de code déjà existante — respect des conventions en place, rétrocompatibilité de l'API publique, gestion versionnée des migrations de base de données, non-régression, minimisation du périmètre de changement. À utiliser systématiquement dès qu'une tâche modifie un projet qui n'est pas créé de zéro, en particulier s'il expose une API consommée par d'autres, ou si un changement de schéma de base de données est nécessaire. Complète workflow-dev (qui explore l'existant) avec les règles de compatibilité proprement dites.
---

# Intervenir sur un projet existant

## Respecter les conventions en place

- Respecter le style, la structure et les patterns déjà utilisés (gestion d'erreurs, framework de tests, organisation des modules) plutôt que d'en introduire de nouveaux sans raison.
- Si une convention existante pose un problème réel pour la tâche en cours, le signaler explicitement à l'utilisateur plutôt que de la contourner silencieusement.
- Ne pas reformater ou réorganiser du code hors du périmètre de la tâche demandée, même si l'occasion s'y prête — proposer ce refactoring séparément si pertinent.

## Minimiser le périmètre de changement

- Préférer le changement le plus ciblé qui résout correctement la tâche plutôt qu'une réécriture large non demandée.
- Si une modification plus large semble nécessaire pour bien faire les choses, l'expliquer et la faire valider séparément avant de l'inclure (voir `workflow-dev`).

## Rétrocompatibilité de l'API publique

Ne pas modifier ou supprimer un endpoint, un champ de réponse, ou une signature de fonction publique existante sans que ce soit explicitement demandé ou validé. Préférer, dans l'ordre :
1. l'ajout de nouveaux champs/paramètres optionnels plutôt que la modification de ceux existants ;
2. le versionnement explicite (`/v2/...`, en-tête de version) si un changement incompatible est nécessaire ;
3. la dépréciation progressive (marquer comme `deprecated`, documenter dans le changelog — voir `documentation-dev` — laisser une période de transition) plutôt qu'une suppression immédiate.

## Migrations de base de données

- Toute modification de schéma passe par un outil de migration versionné (`Alembic`, `Prisma Migrate`, `Flyway`, `Django migrations`...) — jamais de modification manuelle du schéma en production.
- Chaque migration est numérotée/horodatée et appliquée dans un ordre déterministe, avec un historique traçable.
- Prévoir un chemin de **rollback** pour chaque migration quand c'est raisonnable. Si une migration est destructive et irréversible (perte de données), le signaler explicitement avant de l'exécuter et recommander une sauvegarde préalable.
- Pour une base en production avec déploiement continu, préférer le **pattern expand/contract** : ajouter la nouvelle structure (colonne nullable, nouvelle table) → migrer/backfiller les données → faire basculer le code applicatif → seulement ensuite supprimer/contraindre l'ancienne structure dans une migration ultérieure.
- Ne jamais faire dépendre une migration de données de test ou spécifiques à un environnement.

## Non-régression

- Vérifier que les tests existants passent toujours après modification (voir `tests-dev`).
- Ne jamais désactiver un test existant pour "faire passer" une modification sans validation explicite de l'utilisateur.
- Vérifier qu'aucune dépendance ajoutée n'entre en conflit de version avec l'existant ; le signaler sinon.

---

## Référence migrations par stack

`references/migrations-per-stack.md` — Laravel, Django/DRF, Spring Boot (Flyway/Liquibase), et particularités PostgreSQL/MySQL/SQLite.
