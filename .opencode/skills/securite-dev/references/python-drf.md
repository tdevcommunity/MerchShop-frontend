# Sécurité — Python / Django REST Framework

## Configuration
- `.env` (non commité) + `.env.example` (commité, à jour), lu via `django-environ` ou `python-decouple` — jamais `SECRET_KEY`/credentials DB en dur dans `settings.py`.
- `DEBUG = False` en production, obligatoirement piloté par variable d'env, jamais codé en dur à `True`.
- `ALLOWED_HOSTS` explicite (pas de `*`) en production.

## Validation
- Les `Serializer` DRF sont le point de validation : déclarer les champs avec leurs contraintes (`max_length`, `required`, `validators=[...]`) plutôt que de valider manuellement dans la vue.
- Utiliser `validate_<field>()` et `validate()` pour les règles inter-champs plutôt que de la logique dans la vue.

## Injections
- Toujours passer par l'ORM Django (`Model.objects.filter(...)`) — si une requête brute (`raw()`, `RawSQL`) est nécessaire, utiliser des paramètres liés, jamais de f-string/`%` dans la requête.

## Authentification & autorisation
- `djangorestframework-simplejwt` ou Django REST Knox pour les tokens plutôt qu'un système fait maison.
- Hachage des mots de passe géré par le hasher Django par défaut (PBKDF2/Argon2 selon config) — ne jamais stocker un mot de passe via `models.CharField` sans passer par `set_password()`.
- `permission_classes` DRF sur **chaque** `ViewSet`/`APIView` sensible (`IsAuthenticated`, permission custom vérifiant l'ownership de l'objet) — ne jamais s'appuyer uniquement sur `IsAuthenticated` pour une ressource appartenant à un utilisateur précis (IDOR).
- Limiter les tentatives de connexion via `django-axes` ou un throttle DRF dédié (`AnonRateThrottle`/`UserRateThrottle` sur la vue de login).

## CSRF / XSS
- CSRF activé par défaut pour les vues basées sur session ; pour une API stateless en JWT/token, le CSRF classique ne s'applique pas mais vérifier que les cookies de session ne sont pas utilisés en parallèle sans protection.
- Les templates Django échappent par défaut (`{{ }}`) — ne jamais utiliser `|safe` sur une donnée utilisateur non sanitizée.

## Uploads
- Valider extension et taille via un `FileField`/`ImageField` avec validators DRF (`FileExtensionValidator`), et vérifier le type MIME réel côté serveur (ex. `python-magic`) en plus de l'extension.
- `MEDIA_ROOT` hors de la racine servie statiquement sans contrôle ; noms de fichiers générés (UUID), jamais le nom original.

## Dépendances
- `requirements.txt`/`poetry.lock` à jour ; `pip-audit` ou `safety` pour détecter les CVE connues.
