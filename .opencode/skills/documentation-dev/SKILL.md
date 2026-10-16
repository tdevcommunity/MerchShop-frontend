---
name: documentation-dev
description: Définit les exigences de documentation pour le code livré par un agent IA — README, spécification OpenAPI/Swagger, changelog, documentation des variables de configuration. À utiliser dès qu'une tâche ajoute une dépendance externe, une commande, un endpoint d'API, une variable d'environnement, ou change un comportement visible par d'autres développeurs ou par des clients de l'API. S'utilise seul pour mettre à jour ou créer la documentation d'un projet existant, ou combiné aux autres skills de la suite pour une tâche de développement complète.
---

# Documentation

## README

Un README doit permettre à quelqu'un d'inconnu au projet de le faire tourner sans aide extérieure. Contenu minimal :
- objectif du projet en une ou deux phrases ;
- prérequis (langage, version, services externes) ;
- instructions d'installation et de lancement local ;
- comment lancer les tests ;
- structure du projet en bref ;
- comment contribuer, si le projet accepte des contributions.

Le tenir à jour à chaque changement structurant (nouvelle dépendance externe, nouvelle commande, changement de configuration) — un README obsolète est traité comme un défaut à signaler, pas comme un détail secondaire.

## OpenAPI / Swagger

Toute API HTTP doit avoir sa spécification tenue à jour : endpoints, schémas de requête/réponse, codes d'erreur.
- Générer automatiquement la spécification depuis le code quand le framework le permet plutôt que de la maintenir manuellement en parallèle :
  - Laravel : `L5-Swagger` (annotations) ou `Scribe` (génération depuis les Form Requests/Resources).
  - DRF : `drf-spectacular` (recommandé, basé sur les Serializers/ViewSets) ou `drf-yasg`.
  - Spring Boot : `springdoc-openapi` (génère depuis les annotations Bean Validation/Spring MVC, expose `/swagger-ui.html`).
- Si la génération automatique n'est pas possible, mettre à jour manuellement la spécification dans la même action que le changement de code qui la rend obsolète, jamais dans une action séparée ultérieure.

## Changelog

- Consigner les changements notables pour tout projet publié ou consommé par d'autres équipes/clients, au format type "Keep a Changelog", avec versionnement sémantique.
- Toute entrée de changelog distingue clairement : ajout, changement, dépréciation, suppression, correction, sécurité.
- Un changement d'API impactant la compatibilité (voir `projet-existant`) doit systématiquement apparaître au changelog, même si le README n'est pas impacté.

## Documentation de configuration

- Toute variable d'environnement ou paramètre de configuration doit être documenté : nom, rôle, valeur par défaut, obligatoire ou non.
- Fournir a minima un fichier `.env.example` (sans valeurs réelles) reflétant fidèlement les variables consommées par le code — le maintenir synchronisé à chaque ajout/suppression de variable.

---

Ce skill ne couvre pas le contenu technique du code lui-même (voir `qualite-code`) ni les choix d'architecture (voir `nouveau-projet`) — uniquement ce qui doit en être documenté.
