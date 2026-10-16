---
name: livraison-dev
description: Régit la clôture de toute tâche de développement confiée à un agent IA — résumé détaillé fichier par fichier, checklist finale consolidée, signalement explicite des limitations, et demande formelle d'acceptation ou de rejet du travail par l'utilisateur. À utiliser systématiquement à la fin de toute tâche de code déclenchée avec workflow-dev, une fois l'implémentation réalisée et validée étape par étape. Ne jamais considérer une tâche de code terminée sans être passé par ce skill.
---

# Livraison

## Résumé explicite, fichier par fichier

Produire un résumé organisé **fichier par fichier**, jamais un résumé global vague ("j'ai fait les changements demandés"). Pour chaque fichier créé, modifié ou supprimé, indiquer :
- le chemin du fichier et la nature du changement ;
- ce qui a été fait concrètement (fonctions ajoutées, logique modifiée, dépendances introduites, migration créée) ;
- les points notables de sécurité/performance/qualité appliqués dans ce fichier, s'ils sont pertinents.

## Checklist finale

Passer en revue avant de présenter le résumé, en s'appuyant sur les skills mobilisés pour la tâche :

**Sécurité** (`securite-dev`)
- [ ] Entrées externes validées ; aucune requête construite par concaténation non paramétrée
- [ ] Aucun secret en dur ni loggé ; rotation possible sans changement de code
- [ ] Authentification et autorisation vérifiées par ressource, tentatives de connexion limitées
- [ ] CORS restreint, rate limiting sur les endpoints sensibles, uploads validés (type réel + taille)

**Qualité et tests** (`qualite-code`, `tests-dev`)
- [ ] Erreurs gérées explicitement, messages utilisateur non techniques
- [ ] Logs structurés sans données sensibles ; health check présent si service long-running
- [ ] Tests couvrant au moins le cas nominal et un cas d'entrée invalide

**Données et performance** (`projet-existant`, `performance-dev`)
- [ ] Migrations DB versionnées, rollback prévu ou signalé si impossible
- [ ] Pas de N+1 évident, pagination en place sur les collections potentiellement grandes

**Documentation et compatibilité** (`documentation-dev`, `projet-existant`)
- [ ] README/OpenAPI/changelog/config mis à jour si le changement les impacte
- [ ] Compatibilité API publique préservée, ou changement versionné/documenté

## Signalement des limitations

Tout point de la checklist ci-dessus qui n'a pas pu être respecté (contrainte du projet, prototype volontairement simplifié, périmètre hors de la tâche) doit être signalé explicitement dans le résumé, avec sa justification — jamais passé sous silence.

## Acceptation ou rejet du travail

- À la fin du résumé, demander explicitement si l'utilisateur **accepte** ou **rejette** le travail effectué.
- **Accepté** → la tâche est terminée.
- **Rejeté** (en tout ou partie) → clarifier ce qui ne convient pas, proposer un plan correctif limité au périmètre concerné (retour à `workflow-dev`), et ne pas toucher aux parties déjà acceptées sans nouvelle validation.
- Ne jamais considérer une tâche comme terminée sans cette confirmation finale de l'utilisateur.
