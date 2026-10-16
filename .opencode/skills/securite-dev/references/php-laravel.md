# Sécurité — PHP / Laravel

## Configuration
- `.env` (non commité) + `.env.example` (commité, à jour) — géré nativement par Laravel via `config/*.php` qui lit `env()`. Ne jamais appeler `env()` en dehors des fichiers `config/`, toujours passer par `config('...')` dans le code applicatif (sinon le cache de config casse la lecture).
- `php artisan config:cache` en production : vérifier qu'aucun secret n'est perdu/mal résolu après mise en cache.

## Validation
- Utiliser les `Form Request` (`php artisan make:request`) avec des règles de validation explicites plutôt que de valider à la main dans le contrôleur.
- Règles `required`, `email`, `exists`, `unique`, bornes (`max`, `min`) systématiques sur les champs utilisateur.

## Injections
- Toujours passer par Eloquent ou le Query Builder (`DB::table(...)->where(...)`) — jamais de `DB::select("... $variable ...")` avec une variable interpolée. Utiliser les bindings (`?` ou `:param`) si une requête brute est nécessaire.

## Authentification & autorisation
- Utiliser Laravel Sanctum ou Passport pour les API plutôt qu'un système de token fait maison.
- Hachage des mots de passe : `Hash::make()` (bcrypt par défaut) — ne jamais désactiver ce comportement.
- Autorisation : Policies (`php artisan make:policy`) et Gates, appliquées systématiquement sur les actions sensibles (`$this->authorize('update', $model)`), pas seulement le middleware `auth`.
- Limiter les tentatives de connexion avec le throttle middleware (`throttle:login`) ou un rate limiter dédié (`RateLimiter::for('login', ...)`).

## CSRF / XSS
- CSRF : le middleware `VerifyCsrfToken` est actif par défaut sur les routes web — ne jamais l'exclure sans raison documentée.
- Blade échappe automatiquement (`{{ }}`) — ne jamais utiliser `{!! !!}` sur une donnée utilisateur non sanitizée.

## Uploads
- Valider avec les règles `file`, `mimes:`, `max:` (taille en Ko) dans le Form Request.
- Stocker via `Storage::disk('local')` ou un disque dédié hors du `public/` accessible directement, avec un nom généré (`Str::uuid()`), jamais le nom original du client.

## Dépendances
- `composer.lock` commité et à jour ; `composer audit` pour détecter les CVE connues.
