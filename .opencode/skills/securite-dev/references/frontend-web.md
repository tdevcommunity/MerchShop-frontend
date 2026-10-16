# Sécurité — Vue.js / Next.js / Angular

## Configuration
- `.env` (non commité) + `.env.example` (commité, à jour).
- **Ne jamais mettre un secret réel dans une variable exposée au bundle client** :
  - Vue (Vite) : seules les variables préfixées `VITE_` sont exposées au client — n'y mettre que du non-sensible (URL d'API publique, clé publique).
  - Next.js : seules les variables préfixées `NEXT_PUBLIC_` sont exposées au client ; tout secret (clé API tierce, credentials DB) reste sans préfixe et n'est lu que côté serveur (API routes, Server Actions, `getServerSideProps`).
  - Angular : les variables d'environnement sont injectées à la compilation (`environment.ts`) et finissent dans le bundle client — n'y placer aucun secret, uniquement des URLs/clés publiques.

## XSS
- Vue : éviter `v-html` sur du contenu utilisateur non sanitizé ; si nécessaire, passer par `DOMPurify` avant injection.
- Angular : Angular échappe par défaut via son moteur de templates ; ne jamais utiliser `bypassSecurityTrustHtml`/`innerHTML` direct sur une donnée utilisateur sans sanitisation explicite.
- Next.js/React : éviter `dangerouslySetInnerHTML` sur du contenu utilisateur non sanitizé.

## Appels API et secrets tiers
- Next.js : toute clé secrète d'API tierce (paiement, email) doit être appelée depuis une API route/Server Action (exécution serveur), jamais depuis un composant client.
- Vue/Angular (SPA pure sans backend intégré) : ne jamais appeler directement une API tierce nécessitant une clé secrète depuis le frontend — passer par un backend (Laravel/DRF/Spring Boot) qui détient la clé.

## Authentification côté client
- Stocker le token de session en cookie `HttpOnly` + `Secure` + `SameSite` géré par le backend plutôt qu'en `localStorage`/`sessionStorage` quand le risque XSS est significatif (données sensibles, accès admin).
- Next.js avec middleware/Server Components : privilégier la vérification de session côté serveur plutôt que côté client uniquement.

## CORS et CSP
- Vérifier que le backend (Laravel/DRF/Spring Boot) autorise explicitement l'origine du frontend en développement et production — jamais `*` si des cookies d'authentification sont utilisés.
- Définir une CSP au niveau du serveur/hébergement (Next.js : `headers()` dans `next.config.js` ; Angular/Vue : au niveau du serveur statique/CDN) plutôt que de s'en remettre aux valeurs par défaut.

## Dépendances
- `package-lock.json`/`pnpm-lock.yaml` à jour ; `npm audit` pour détecter les CVE connues, en particulier sur les dépendances ayant accès au DOM (risque XSS via dépendance compromise).
