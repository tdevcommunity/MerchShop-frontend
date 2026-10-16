# Tests — Flutter / React Native

## Flutter

- `flutter_test` pour les widget tests (`testWidgets`) : monter un widget, simuler une interaction (`tester.tap`, `tester.enterText`), vérifier le rendu résultant.
- `bloc_test` pour tester un Bloc/Cubit isolément : donner un state initial, dispatcher des events, vérifier la séquence exacte de states émis — sans monter l'UI (voir `qualite-code/references/bloc-flutter.md`).
- `mocktail` (ou `mockito`) pour mocker les repositories injectés dans le Bloc, afin de tester la logique métier sans dépendance réseau/DB réelle.
- Tests d'intégration (`integration_test`) sur les parcours critiques (connexion, paiement) en complément des widget tests, avec parcimonie (plus lents à exécuter).

## React Native

- Jest + React Native Testing Library pour les composants et hooks, en testant le comportement observable plutôt que les détails d'implémentation.
- Mock des modules natifs (stockage sécurisé, biométrie, notifications) via les mocks fournis par les librairies ou des mocks manuels dans `__mocks__/`.
- Detox (ou Maestro) pour les tests end-to-end sur device/simulateur, réservés aux parcours critiques vu leur coût d'exécution plus élevé.

## Principe commun

Dans les deux cas, isoler la logique métier (Bloc/hook) de l'UI permet de la tester sans monter l'interface graphique — c'est cette séparation, déjà exigée par l'architecture (`qualite-code`), qui rend les tests rapides et fiables plutôt que dépendants du rendu.
