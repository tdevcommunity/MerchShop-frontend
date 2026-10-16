# Scaffolding — structure et Docker par stack

## Backend

### Laravel
```
app/
  Http/Controllers/
  Http/Requests/
  Models/
  Services/        # ou Actions/
  Repositories/     # si le projet en a besoin (§ clean-architecture-backend)
  Policies/
routes/
  api.php
database/
  migrations/
  factories/
tests/
  Feature/
  Unit/
.env / .env.example
```
- Image Docker de base : `php:8.3-fpm` (ou version imposée par le projet) + Nginx séparé, ou `serversideup/php` pour une image prête pour Laravel. Utilisateur non-root, `composer install --no-dev` dans le stage final.

### Django / DRF
```
project/
  settings/          # base.py, dev.py, prod.py
apps/
  <domaine>/
    models.py
    serializers.py
    views.py
    services.py
    urls.py
    tests/
.env / .env.example
```
- Découper `settings.py` en plusieurs fichiers (base/dev/prod) plutôt qu'un seul fichier avec des `if DEBUG`.
- Image Docker de base : `python:3.12-slim`, dépendances installées dans un stage de build séparé, utilisateur non-root, `gunicorn`/`uvicorn` en production (jamais `runserver`).

### Spring Boot
```
src/main/java/.../
  controller/
  service/
  repository/
  domain/ (entities)
  dto/
  config/
src/main/resources/
  application.properties / application.properties.example
  db/migration/          # Flyway
src/test/java/...
```
- Organisation package-by-feature recommandée au-delà d'un petit projet (`orders/`, `users/`, chacun avec son controller/service/repository) plutôt que package-by-layer global.
- Image Docker de base : build multi-stage avec Maven/Gradle (`maven:3.9-eclipse-temurin-21` puis `eclipse-temurin:21-jre` pour l'image finale), utilisateur non-root.

## Frontend web

### Vue.js (Vite)
```
src/
  features/<domaine>/
    components/
    composables/
    api/
  router/
  stores/            # Pinia
.env / .env.example
```

### Next.js
```
app/                 # ou pages/ selon la version
  (routes)/
lib/
  services/
  api/
components/
.env / .env.example
```

### Angular
```
src/app/
  <domaine>/
    <domaine>.component.ts
    <domaine>.service.ts
  shared/
environments/
  environment.ts
  environment.prod.ts
```
- Image Docker (si SSR/serveur de rendu) : build multi-stage Node → image finale Nginx pour servir le build statique (Vue/Angular) ou Node runtime pour Next.js SSR.

## Mobile

### Flutter
```
lib/
  features/<domaine>/
    bloc/
    data/
    presentation/
  core/
    di/
    network/
```
- Pas de `Dockerfile` applicatif classique (build via `flutter build apk`/`ipa` en CI) ; prévoir un pipeline CI avec cache des dépendances Flutter (`flutter pub get`).

### React Native
```
src/
  features/<domaine>/
    hooks/
    screens/
    api/
  navigation/
  store/
```
- Idem Flutter : build via CI dédiée (EAS Build pour Expo, ou Fastlane pour bare React Native), pas de conteneurisation applicative classique.

## Principe commun

Dans tous les cas : dossiers organisés par domaine fonctionnel plutôt que par type technique dès que le projet dépasse quelques écrans/endpoints (voir `qualite-code` pour la justification), et fichier d'environnement réel + exemple créé dès l'initialisation (voir `securite-dev`).
