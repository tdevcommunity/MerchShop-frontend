---
name: securite-dev
description: Applique les règles de sécurité et de validation des entrées lors de l'écriture ou de la revue de code par un agent IA — validation des entrées, injections SQL/shell, XSS, CSRF, SSRF, gestion des secrets et de leur rotation, authentification, autorisation, upload de fichiers, rate limiting, HTTPS, CORS, en-têtes de sécurité, dépendances vulnérables. À utiliser systématiquement dès qu'une tâche touche à une entrée externe (utilisateur, API, fichier), une authentification, des permissions, des secrets, un appel réseau, ou l'exposition d'une API — même si l'utilisateur ne mentionne pas explicitement "sécurité". S'utilise seul pour une revue de sécurité ciblée, ou combiné aux autres skills de la suite (workflow-dev, qualite-code, etc.) pour une tâche de développement complète.
---

# Sécurité

## Validation des entrées (règle non négociable)

- **Ne jamais faire confiance à une donnée externe** : entrée utilisateur, requête HTTP, fichier uploadé, réponse d'API tierce, variable d'environnement, argument CLI.
- Valider au plus tôt, à la frontière du système (edge validation), avant tout traitement métier.
- Utiliser un schéma de validation déclaratif plutôt que des `if` dispersés (`pydantic`/`marshmallow` en Python, `zod`/`yup`/`ajv` en JS/TS, `validator`/JSON Schema en Go).
- Valider : type, format, longueur/bornes, encodage, valeurs autorisées (whitelist plutôt que blacklist).
- Rejeter explicitement les entrées invalides avec un message clair, sans exposer de détails internes sensibles.

## Injections et exécution de code

- Aucune requête SQL/NoSQL construite par concaténation de chaînes → ORM ou requêtes paramétrées/préparées systématiquement (SQL, mais aussi LDAP, XPath).
- Aucun `eval`, `exec`, `os.system`, `subprocess(shell=True)`, `Function()` sur une entrée non fiable.
- Exécution de commandes système : liste d'arguments explicite (pas de shell), whitelist de commandes autorisées.
- **SSRF** : valider/restreindre les URLs si l'agent doit faire des requêtes sortantes basées sur une entrée utilisateur (bloquer les plages IP internes, résoudre et vérifier la destination réelle).

## XSS

- Pour tout champ affiché ensuite dans une page web : encoder/échapper en sortie selon le contexte (HTML, attribut, JS, URL) — ne pas se reposer uniquement sur la validation en entrée.
- Ne jamais insérer du HTML dynamique non sanitizé (`dangerouslySetInnerHTML`, `v-html`, `innerHTML`) sans passer par un sanitizer dédié (ex. `DOMPurify`).

## CSRF

- Pour toute action modifiant un état serveur via formulaire/session cookie : token CSRF ou vérification stricte `SameSite`/origine.

## Secrets et configuration

- Jamais de secret en dur dans le code. Variables d'environnement ou gestionnaire de secrets dédié (Vault, AWS Secrets Manager...).
- **Fichier d'environnement systématique**, quel que soit le framework :
  - Laravel, DRF, Vue/Next/Angular/Node : un `.env` (non commité) + un `.env.example` (commité, valeurs factices/vides) tenu à jour à chaque ajout/suppression de variable.
  - Spring Boot : un `application.properties` (ou `application.yml`) contenant les valeurs réelles (non commité s'il contient des secrets, ou externalisé via variables d'environnement/`application-local.properties`) + un `application.properties.example` (ou `application.yml.example`) commité avec les clés attendues et des valeurs factices.
  - Créer ce couple fichier réel/exemple dès la mise en place du projet (voir `nouveau-projet`) et le maintenir synchronisé à chaque tâche qui ajoute une variable de config — ne jamais laisser le fichier `.example` diverger du fichier réel.
- `.gitignore` (ou `.gitignore`/`.dockerignore`) à jour pour exclure `.env`, `application.properties` (ou `application-*.properties` locaux), clés privées, fichiers de credentials — mais jamais les fichiers `.example`.
- **Rotation** : concevoir la configuration pour permettre de changer un secret sans changement de code. Signaler si un secret sensible n'a pas de procédure de rotation prévue.
- Ne jamais logger de secrets, tokens, mots de passe ou données personnelles sensibles en clair.

## Authentification

- Hacher les mots de passe avec un algorithme lent dédié (`argon2`, `bcrypt`, `scrypt`) — jamais MD5/SHA1/SHA256 seul.
- **Limiter les tentatives de connexion** : verrouillage progressif ou backoff après un nombre défini d'échecs, par compte et/ou par IP. Ne jamais renvoyer un message distinguant "email inconnu" de "mot de passe incorrect".
- Générer tokens de session/API avec un générateur cryptographiquement sûr (`secrets` en Python, `crypto.randomBytes`/`randomUUID` en Node) — jamais `random`/`Math.random`.

## Autorisation

- Vérifier l'autorisation à **chaque** endpoint/action sensible, pas seulement l'authentification (éviter l'IDOR : vérifier le droit sur *cette* ressource précise, pas juste que l'utilisateur est connecté).
- Appliquer le principe du moindre privilège (permissions DB, rôles IAM, scopes OAuth).

## Upload de fichiers

- Limiter explicitement la **taille maximale** de fichier, côté serveur (pas seulement côté client).
- Valider le **type MIME réel** par inspection du contenu (magic bytes), pas seulement l'extension ou le `Content-Type` déclaré.
- Stocker hors de la racine web exécutable, avec un nom généré côté serveur (jamais le nom fourni par le client tel quel).
- Si les fichiers sont resservis publiquement, empêcher leur exécution (`Content-Disposition`, `X-Content-Type-Options: nosniff`).

## Rate limiting

- Limitation de débit sur les endpoints publics, plus stricte sur les endpoints sensibles (login, reset password, envoi d'email, paiement).
- Comportement explicite en cas de dépassement (429 + `Retry-After`), pas un échec silencieux ou une 500.

## CORS

- Liste blanche explicite d'origines autorisées — jamais `Access-Control-Allow-Origin: *` sur une API utilisant des cookies d'authentification.
- Restreindre méthodes et en-têtes autorisés au strict nécessaire.

## Transport et en-têtes de sécurité

- HTTPS/TLS pour tout échange réseau impliquant des données sensibles.
- Chiffrer les données sensibles au repos si le contexte l'exige (PII, données de santé/financières).
- En-têtes par défaut pour les apps web : `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, cookies `HttpOnly` + `Secure` + `SameSite`.

## Dépendances et supply chain

- Épingler les versions dans un fichier de lock.
- Ne pas ajouter de dépendance sans vérifier qu'elle est maintenue et raisonnablement populaire ; éviter les paquets typosquattés.
- Signaler une dépendance requise connue pour des CVE, et proposer une alternative si possible.

---

## Références par stack

Consulter la référence correspondant à la partie du code concernée :
- `references/php-laravel.md` — backend PHP/Laravel
- `references/python-drf.md` — backend Python/Django REST Framework
- `references/java-spring-boot.md` — backend Java/Spring Boot
- `references/frontend-web.md` — Vue.js, Next.js, Angular
- `references/mobile.md` — Flutter, React Native

Les règles génériques ci-dessus s'appliquent dans tous les cas ; les références précisent comment les implémenter concrètement dans chaque framework.
