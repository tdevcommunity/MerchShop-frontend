# Bases de données et ORM — PostgreSQL / MySQL / SQLite

## Choix du moteur selon le contexte

- **PostgreSQL** : par défaut recommandé pour un backend applicatif (Laravel/DRF/Spring Boot) avec des besoins relationnels sérieux — support avancé des index (GIN, partiels, expressions), JSONB indexable, transactions robustes.
- **MySQL** : viable si contrainte d'hébergement/écosystème existant l'impose ; attention aux différences de comportement avec PostgreSQL (collation, gestion des NULL dans les contraintes uniques, `GROUP BY` moins strict par défaut) lors d'une migration entre les deux.
- **SQLite** : adapté au développement local, aux tests, et aux applications mobiles/embarquées (stockage local Flutter/React Native) — **ne pas utiliser en production pour un backend multi-utilisateur à écriture concurrente significative** (verrouillage au niveau fichier).

## N+1 par ORM

- **Eloquent (Laravel)** : `Model::with('relation')` pour l'eager loading ; repérer les boucles `foreach ($items as $item) { $item->relation }` sans `with()` préalable — activer `Model::preventLazyLoading()` en environnement de développement pour détecter les N+1 automatiquement.
- **Django ORM (DRF)** : `select_related()` pour les relations `ForeignKey`/`OneToOne` (jointure SQL), `prefetch_related()` pour les relations `ManyToMany`/inverses (requête séparée + jointure en mémoire) — utiliser `django-debug-toolbar` en développement pour repérer les N+1.
- **Spring Data JPA** : attention au chargement `LAZY` par défaut sur les collections — utiliser `@EntityGraph` ou une jointure `JOIN FETCH` explicite dans la requête JPQL pour charger les relations nécessaires en une requête, plutôt que de laisser Hibernate déclencher une requête par accès.

## Index

- Toujours indexer les clés étrangères (souvent automatique selon le SGBD/ORM, à vérifier explicitement en SQLite et MySQL selon le moteur de stockage).
- `EXPLAIN` (MySQL/SQLite) ou `EXPLAIN ANALYZE` (PostgreSQL) pour vérifier qu'une requête coûteuse utilise bien un index plutôt qu'un scan complet, avant d'optimiser à l'aveugle.

## Pagination

- Laravel : `paginate()`/`cursorPaginate()` (préférer ce dernier pour de gros volumes).
- DRF : `CursorPagination` plutôt que `PageNumberPagination` au-delà d'un volume significatif ou d'un tri instable.
- Spring Data JPA : `Pageable`/`Slice` ; privilégier une pagination par keyset (requête avec condition sur la dernière valeur vue) plutôt qu'un `OFFSET` élevé sur de gros volumes.
