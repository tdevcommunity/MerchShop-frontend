# Sécurité — Flutter / React Native

## Configuration
- `.env` (non commité) + `.env.example` (commité, à jour) :
  - Flutter : `flutter_dotenv` (chargé au runtime) ou `--dart-define`/`--dart-define-from-file` (injecté à la compilation) — préférer `--dart-define` pour les valeurs qui ne doivent pas être lisibles dans l'assets bundle.
  - React Native : `react-native-config` ou `react-native-dotenv`.
- **Un secret embarqué dans l'application mobile n'est jamais réellement secret** (l'app peut être décompilée) : toute clé véritablement sensible (secret API, clé de signature serveur) doit rester côté backend (Laravel/DRF/Spring Boot) et n'être jamais embarquée dans le bundle mobile, même via `.env`.

## Stockage sécurisé
- Ne jamais stocker un token de session ou des données sensibles en clair dans `SharedPreferences` (Flutter) ou `AsyncStorage` (React Native) — utiliser le stockage chiffré natif :
  - Flutter : `flutter_secure_storage` (Keychain iOS / Keystore Android).
  - React Native : `react-native-keychain` ou `expo-secure-store`.

## Communication réseau
- HTTPS obligatoire pour tous les appels ; activer le certificate pinning pour les endpoints critiques (paiement, authentification) via `dio`/`http` + `HttpClient` custom (Flutter) ou `react-native-ssl-pinning`/`TrustKit` (React Native) si le niveau de risque le justifie.
- Ne jamais désactiver la validation de certificat SSL même en développement dans un code qui pourrait finir en production (garder ces exceptions strictement conditionnées à un flag de build debug).

## Authentification
- Utiliser biométrie/PIN comme second facteur local (`local_auth` en Flutter, `react-native-biometrics` en React Native) plutôt que de stocker le mot de passe en clair pour un "rester connecté".
- Invalider et effacer le stockage sécurisé (token, credentials) à la déconnexion explicite.

## Deep links et intents
- Valider et whitelister les schémas/domaines acceptés par les deep links (`App Links`/`Universal Links` en Flutter, `Linking` en React Native) — ne jamais faire confiance à un paramètre de deep link sans validation avant de déclencher une action sensible (navigation vers paiement, changement de compte).

## Uploads
- Valider taille et type MIME réel côté client avant envoi (limiter la bande passante gaspillée) **et** revalider systématiquement côté serveur (le contrôle client ne suffit jamais, voir `php-laravel.md`/`python-drf.md`/`java-spring-boot.md`).

## Dépendances
- `pubspec.lock` (Flutter) / `package-lock.json` ou `yarn.lock` (React Native) commités et à jour ; vérifier les permissions natives demandées (`AndroidManifest.xml`, `Info.plist`) et ne demander que celles réellement nécessaires.
