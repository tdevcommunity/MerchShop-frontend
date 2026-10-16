---
name: qualite-code
description: Applique les principes de qualité, de lisibilité et d'architecture du code écrit ou modifié par un agent IA — clean code, SOLID, SRP, DRY, clean architecture (séparation domaine/use-cases/infrastructure/présentation), BLoC pour le mobile Flutter, typage, nommage, découpage des fonctions/modules, gestion des erreurs et du logging, fiabilité en environnement concurrent, observabilité (logs structurés, métriques, traces, health checks). À utiliser systématiquement pour toute tâche d'écriture, de modification ou de revue de code, quel que soit le langage. S'utilise seul pour une revue de qualité/architecture ciblée, ou combiné aux autres skills de la suite pour une tâche de développement complète.
---

# Qualité de code

## Lisibilité et nommage

- Noms explicites (variables, fonctions, classes) — pas d'abréviations obscures.
- Pas de nombres magiques ni de chaînes en dur répétées → constantes nommées/configuration.
- Commentaires : expliquer le "pourquoi", pas le "quoi" (le code doit déjà dire le quoi).

## SOLID, SRP, DRY

- **SRP** : une fonction, une responsabilité. Envisager de découper au-delà de ~40-50 lignes ou dès qu'une fonction fait plusieurs choses distinctes.
- **DRY** : éviter la duplication, sans sur-abstraction prématurée — factoriser quand un motif se répète réellement, pas par anticipation.
- **SOLID** au niveau des classes/modules quand le langage et le paradigme s'y prêtent : ouverture à l'extension sans modification du code existant (O), substituabilité des implémentations (L), interfaces spécifiques plutôt qu'une interface fourre-tout (I), dépendance vers des abstractions plutôt que des implémentations concrètes (D).
- Séparer explicitement les couches : logique métier, accès aux données, présentation/API, configuration.

## Typage

- Typage explicite quand le langage le permet (type hints Python, TypeScript plutôt que JS non typé, génériques en Go/Rust).
- Éviter les types "fourre-tout" (`any`, `object`, `dict` non typé) sur les interfaces publiques d'un module.

## Gestion des ressources et de l'état

- Fermer explicitement fichiers, connexions DB, sockets (context managers, `try/finally`, `defer`).
- Éviter la mutation d'état global partagé sans nécessité ; préférer l'immutabilité quand c'est raisonnable.

## Gestion des erreurs et logging

- Ne jamais avaler silencieusement une exception (`except: pass` / `catch {}` vide) sans justification explicite en commentaire.
- Différencier erreurs attendues (métier, à gérer) des erreurs inattendues (à logger + remonter).
- Messages d'erreur utilisateur : génériques et non techniques. Détails techniques (stack trace, requête SQL, chemin interne) → uniquement dans les logs serveur.
- Ne jamais logger de secrets, tokens ou données personnelles identifiables brutes (voir aussi `securite-dev`).

## Concurrence et fiabilité

- Protéger les sections critiques partagées (locks, transactions atomiques) en cas d'accès concurrent.
- Prévoir l'idempotence des opérations réseau/paiement quand c'est pertinent (retry sans double effet).
- Timeouts explicites sur tout appel réseau/externe — jamais d'appel bloquant sans limite.

## Observabilité

- **Logs structurés** : format exploitable (JSON) plutôt que texte libre quand le projet le permet, avec niveau approprié (`debug/info/warning/error/critical`) et contexte utile (id de requête, id utilisateur non sensible).
- **Métriques** : exposer au minimum latence, taux d'erreur, débit pour un service long-running (ex. endpoint `/metrics` style Prometheus).
- **Traces** : pour un système multi-services, propager un identifiant de corrélation à travers logs et appels sortants (headers type W3C Trace Context / OpenTelemetry).
- **Health checks** : exposer un endpoint de liveness et, si pertinent, un endpoint de readiness distinct (dépendances DB/cache accessibles), utilisables par l'orchestrateur ou le load balancer.

## Clean Architecture

- Organiser le code en couches indépendantes, avec une règle de dépendance à sens unique (l'extérieur dépend de l'intérieur, jamais l'inverse) :
  - **Domaine/entités** : règles métier pures, sans dépendance à un framework, une DB ou le réseau.
  - **Cas d'usage/services applicatifs** : orchestrent le domaine pour réaliser une action métier précise.
  - **Infrastructure** : implémentations concrètes (accès DB, appels HTTP externes, système de fichiers) derrière des interfaces définies par le domaine.
  - **Présentation** : contrôleurs/API, UI — traduisent les entrées externes vers les cas d'usage et les résultats vers un format de sortie.
- Le domaine ne doit jamais importer une classe d'infrastructure ou de framework (ex. pas d'annotation ORM dans une entité métier pure si le langage/l'équipe vise une séparation stricte — à adapter pragmatiquement selon le framework, voir références par stack).
- Ne pas imposer une séparation en couches complète sur un script ou un module trivial — l'effort de structuration doit être proportionné à la complexité et à la durée de vie du code (voir aussi `nouveau-projet` pour la structure initiale d'un projet).

## BLoC (Flutter)

- Pour toute application ou fonctionnalité Flutter avec état non trivial, séparer explicitement la logique métier/état de l'UI via le pattern BLoC (`flutter_bloc`) : Events/inputs → Bloc/Cubit → States → Widgets qui ne font qu'afficher l'état et émettre des events.
- Les widgets ne contiennent pas de logique métier ni d'appel direct à un repository/service — ils dispatchent des events et écoutent les states (`BlocBuilder`/`BlocListener`/`BlocConsumer`).
- Voir `references/bloc-flutter.md` pour le détail.

---

## Références par stack

- `references/clean-architecture-backend.md` — application des couches sur Laravel, DRF, Spring Boot
- `references/clean-architecture-frontend.md` — organisation Vue.js, Next.js, Angular
- `references/bloc-flutter.md` — pattern BLoC en Flutter
- `references/react-native-architecture.md` — organisation React Native

Cette base s'applique à tout langage. Elle se combine avec `securite-dev` pour les aspects sécurité du même code, et `tests-dev` pour sa couverture.
