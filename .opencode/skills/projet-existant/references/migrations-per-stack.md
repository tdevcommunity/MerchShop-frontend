# Migrations — Laravel / DRF / Spring Boot

## Laravel

- `php artisan make:migration` pour chaque changement de schéma, jamais de modification manuelle de la DB.
- Une migration = un changement cohérent ; nommer explicitement (`add_status_to_orders_table`).
- Rollback : implémenter systématiquement la méthode `down()` de façon symétrique à `up()` ; tester `php artisan migrate:rollback` avant de considérer la migration terminée.
- Pattern expand/contract : ajouter une colonne en `nullable()` d'abord, backfiller via une commande Artisan dédiée ou dans la migration elle-même (avec prudence sur les gros volumes), puis contraindre (`nullable(false)`) dans une migration ultérieure une fois le code applicatif basculé.

## Django / DRF

- `python manage.py makemigrations` puis `migrate` ; ne jamais éditer un fichier de migration déjà appliqué en production — créer une nouvelle migration corrective.
- Vérifier le fichier généré avant de l'appliquer (Django peut proposer une valeur par défaut ambiguë sur un champ non-nullable ajouté à une table existante) — préférer un défaut explicite ou une migration de données séparée (`RunPython`) pour le backfill.
- Rollback : `migrate <app> <migration_precedente>` — s'assurer que chaque migration reste réversible (éviter `RunPython` sans fonction `reverse_code` si l'opération doit être annulable).

## Spring Boot (Flyway / Liquibase)

- Flyway : scripts SQL versionnés (`V<numero>__description.sql`) dans `src/main/resources/db/migration`, appliqués dans l'ordre et jamais modifiés une fois committés/appliqués — toute correction passe par un nouveau script.
- Liquibase : changelogs déclaratifs (XML/YAML/SQL) avec `rollback` explicite associé à chaque changeset quand l'opération le permet.
- Ne jamais laisser Hibernate en mode `ddl-auto: update`/`create` en production — le schéma doit être piloté uniquement par les migrations versionnées.

## Particularités par SGBD lors d'une migration de schéma

- **PostgreSQL** : `ALTER TABLE ... ADD COLUMN` avec valeur par défaut est rapide (metadata-only) depuis PG 11+ ; une contrainte `NOT NULL` ajoutée nécessite un scan complet — la découper en plusieurs étapes sur une grosse table (ajout nullable → backfill → contrainte).
- **MySQL** : certaines opérations DDL verrouillent la table selon le moteur de stockage/version (InnoDB avec `ALGORITHM=INPLACE` limite l'impact mais pas toujours disponible) — vérifier l'impact sur une table volumineuse avant d'exécuter en production aux heures de forte charge.
- **SQLite** : support DDL limité (pas d'`ALTER TABLE DROP COLUMN` direct avant SQLite 3.35, pas de modification de type de colonne) — les migrations complexes nécessitent souvent de recréer la table (`CREATE TABLE new AS SELECT ... ; DROP ; RENAME`), à garder en tête si SQLite est utilisé en production (mobile) plutôt qu'en développement/local uniquement.
