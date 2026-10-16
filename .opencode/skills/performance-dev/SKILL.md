---
name: performance-dev
description: Applique les bonnes pratiques de performance au code écrit ou modifié par un agent IA — requêtes N+1, index de base de données, pagination des collections, stratégie de cache, complexité algorithmique. À utiliser dès qu'une tâche implique des accès en base de données via un ORM, des boucles sur des collections potentiellement volumineuses, une API retournant des listes, ou des données coûteuses à recalculer. S'utilise seul pour une revue de performance ciblée, ou combiné aux autres skills de la suite pour une tâche de développement complète.
---

# Performance

## Requêtes N+1

- Vérifier que les accès en boucle à une relation (ORM) utilisent bien un chargement anticipé (`select_related`/`prefetch_related` en Django, `include`/`joinedload` ailleurs) plutôt qu'une requête par itération.
- Repérer les boucles qui déclenchent un appel réseau ou une requête DB à chaque itération et les remplacer par un accès groupé (batch) quand c'est possible.

## Index

- Proposer un index sur les colonnes utilisées dans les clauses de filtre (`WHERE`), de tri (`ORDER BY`) ou de jointure fréquentes, en particulier les clés étrangères et les champs de recherche.
- Signaler les scans de table probables sur de gros volumes plutôt que de les laisser passer silencieusement.
- Ne pas indexer par réflexe systématique : chaque index a un coût en écriture — le justifier par un usage de lecture réel.

## Pagination

- Toute API retournant une collection potentiellement grande doit être paginée dès la conception (limite par défaut + maximum imposé).
- Préférer une pagination par curseur à un `OFFSET` élevé quand le volume ou la fréquence de lecture le justifie (l'`OFFSET` dégrade linéairement avec la profondeur de pagination).

## Cache

- Identifier les données coûteuses à recalculer/récupérer et fréquemment lues comme candidates au cache.
- Définir une stratégie explicite d'invalidation/TTL dès l'introduction du cache — un cache sans stratégie d'invalidation documentée est une source de bug différée.
- Ne jamais mettre en cache des données sensibles sans réflexion sur leur portée d'accès (cache partagé entre utilisateurs vs cache par utilisateur).

## Complexité algorithmique

- Pour tout traitement sur une collection dont la taille peut croître significativement, avoir conscience de la complexité (éviter les O(n²) évitables — recherches en boucle imbriquée remplaçables par un index/set/dictionnaire).
- Ne pas sur-optimiser prématurément une portion de code qui n'est ni un point chaud ni exposée à un volume significatif — signaler le compromis plutôt que d'ajouter de la complexité inutile.

---

## Référence base de données

`references/databases-and-orm.md` — spécificités PostgreSQL/MySQL/SQLite et chargement anticipé par ORM (Eloquent, Django ORM, Spring Data JPA).
