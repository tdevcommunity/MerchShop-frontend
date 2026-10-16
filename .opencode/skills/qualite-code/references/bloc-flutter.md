# BLoC — Flutter

## Principe

- **Event** : ce qui se produit (action utilisateur, résultat d'un appel externe) → envoyé au Bloc via `add()`.
- **Bloc/Cubit** : reçoit les events, exécute la logique métier (souvent en délégant à un repository/use-case), émet un nouveau **State**.
- **State** : représentation immuable de l'état à un instant donné (souvent avec des sous-types explicites : `Loading`, `Loaded`, `Error`).
- **Widget** : observe le state (`BlocBuilder`) et/ou réagit à ses changements (`BlocListener`), dispatche des events — ne contient aucune logique métier ni appel direct à un repository/service.

## Structure recommandée par feature

```
feature_x/
  bloc/
    feature_x_bloc.dart
    feature_x_event.dart
    feature_x_state.dart
  data/
    feature_x_repository.dart
  presentation/
    feature_x_page.dart
    widgets/
```

- Le **Bloc** dépend d'une abstraction de repository (interface), pas d'une implémentation concrète — permet de substituer une source de données factice en test (voir `tests-dev`, `bloc_test`).
- Un **State** par variation significative de l'écran (`FeatureXInitial`, `FeatureXLoading`, `FeatureXLoaded(data)`, `FeatureXError(message)`) plutôt qu'un unique state mutable fourre-tout avec des booléens `isLoading`/`hasError` combinés de façon ambiguë.
- Utiliser `Equatable` (ou équivalent) sur les States/Events pour permettre les comparaisons de valeur et éviter les rebuilds inutiles.

## Bonnes pratiques

- Un Bloc par domaine fonctionnel cohérent, pas un Bloc géant partagé par toute l'application.
- Les appels réseau/DB passent par le repository, jamais directement dans le Bloc (le Bloc orchestre, il n'exécute pas l'I/O lui-même) — cette séparation facilite les tests (voir `references/../tests-dev`).
- Utiliser `Cubit` (version simplifiée, sans Events explicites) pour les cas simples où la distinction Event/State n'apporte pas de valeur ; réserver `Bloc` complet aux flux avec plusieurs déclencheurs distincts à tracer.
