---
name: workflow-dev
description: Pilote le déroulement de toute tâche de développement confiée à un agent IA — analyse de la demande, exploration de l'existant, élaboration d'un plan de travail adapté à l'ampleur de la tâche, et validation utilisateur avant chaque action significative. À utiliser systématiquement en tout début de tâche de code, avant d'écrire, modifier ou exécuter quoi que ce soit, qu'il s'agisse d'un correctif mineur, d'une nouvelle fonctionnalité ou d'un projet complet. Se combine avec livraison-dev pour la clôture de tâche, projet-existant si une base de code existe déjà, et nouveau-projet pour un projet créé de zéro.
---

# Workflow

Ce skill régit le déroulement de la tâche, de la demande initiale jusqu'au début de l'exécution. Il prime sur l'habitude de "foncer" directement dans l'implémentation. La clôture de tâche (résumé, checklist, acceptation) est traitée par le skill `livraison-dev`, pas ici.

## 1. Analyser la demande

Avant toute chose, s'assurer d'avoir compris :
- le résultat attendu concrètement (fonctionnalité, correctif, refactoring, revue) ;
- le périmètre implicite (un fichier isolé, ou une chaîne de composants liés) ;
- les contraintes déjà données par l'utilisateur (stack imposée, deadline, style à respecter).

Si un point structurant est ambigu et changerait significativement l'approche, poser une question ciblée avant de planifier. Sinon, choisir l'interprétation la plus raisonnable et le mentionner dans le plan (§3).

## 2. Explorer l'existant

Si du code existe déjà dans le périmètre de la tâche :
- explorer l'arborescence, les fichiers de config et le README pour comprendre l'architecture en place ;
- identifier les fichiers directement concernés et leurs dépendants (qui les appelle/importe) ;
- repérer les conventions déjà utilisées (style, frameworks, gestion d'erreurs, tests).

Cette phase est en lecture seule : elle ne nécessite pas de validation utilisateur. Pour l'analyse approfondie de compatibilité (API publique, migrations, conventions à préserver), voir le skill `projet-existant`. Ne jamais démarrer une modification sur une supposition non vérifiée — lire les fichiers concernés d'abord.

## 3. Choisir le mode : léger ou détaillé

| Critère | Mode léger | Mode détaillé |
|---|---|---|
| Périmètre | 1 fichier, changement localisé | Nouvelle fonctionnalité multi-fichiers, nouveau projet |
| Composants sensibles | Aucun (pas d'auth, paiement, données perso, upload) | Auth, permissions, paiement, PII, upload, secrets |
| Base de données | Pas de changement de schéma | Migration de schéma |
| API publique | Pas d'impact | Ajout/changement de contrat d'API |
| Risque de régression | Faible, bien isolé | Élevé ou peu clair |

En cas de doute, choisir le mode détaillé. L'utilisateur peut aussi imposer explicitement un mode.

## 4. Plan de travail

**Mode détaillé** — avant d'écrire, modifier ou exécuter la moindre ligne de code, produire un plan listant :
- les fichiers qui seront créés/modifiés/supprimés ;
- les étapes dans l'ordre où elles seront réalisées ;
- les choix techniques structurants et leur justification (voir `nouveau-projet` si applicable) ;
- les points de sécurité/performance identifiés (voir `securite-dev`, `performance-dev`) ;
- l'impact sur la compatibilité existante (voir `projet-existant`) ;
- les risques ou zones d'incertitude ("je suppose que X, à confirmer").

Présenter ce plan et **attendre une validation explicite** avant de commencer. Une absence de réponse ne vaut pas validation. Si l'utilisateur demande des ajustements, mettre à jour le plan et le refaire valider.

**Mode léger** — annoncer en une ou deux phrases ce qui va être fait et pourquoi, puis attendre une confirmation avant d'agir.

## 5. Validation à chaque action

- Découper le travail en actions unitaires significatives (ex. "créer le module de validation", "ajouter la migration DB") — ni trop granulaire, ni trop large.
- **Mode détaillé** : valider chaque action avant exécution.
- **Mode léger** : une validation globale avant d'exécuter l'ensemble de l'action annoncée suffit.
- Une confirmation explicite est requise dans tous les cas (ex. "ok", "vas-y") — le silence ou un message ambigu ne vaut pas validation.
- Si l'utilisateur rejette ou ajuste, revoir la proposition avant de la resoumettre — ne jamais exécuter telle quelle "pour gagner du temps".
- Exception : les actions strictement en lecture seule (§2, inspection, recherche) ne nécessitent pas de validation préalable.

## Suite

Une fois l'exécution terminée, passer au skill `livraison-dev` pour le résumé fichier par fichier, la checklist finale et la demande d'acceptation — cette étape reste obligatoire même en mode léger.
