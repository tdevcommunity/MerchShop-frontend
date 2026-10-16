# Sécurité — Java / Spring Boot

## Configuration
- `application.properties` (ou `application.yml`) avec les valeurs réelles — externaliser les secrets via variables d'environnement (`${DB_PASSWORD}`) plutôt que de les écrire en clair, même dans un fichier non commité.
- `application.properties.example` (ou `.yml.example`) commité, listant toutes les clés attendues avec des valeurs factices.
- Utiliser les profils Spring (`application-dev.properties`, `application-prod.properties`) pour séparer les environnements ; ne jamais committer un profil contenant des secrets réels.
- `.gitignore` : exclure `application-local.properties`, `application-prod.properties` s'ils contiennent des secrets ; garder les fichiers `.example`.

## Validation
- Annoter les DTO d'entrée avec Bean Validation (`@NotNull`, `@Size`, `@Email`, `@Pattern`, etc.) et `@Valid` sur les paramètres de contrôleur — ne jamais valider à la main dans le corps de la méthode.
- Gérer les erreurs de validation via un `@ControllerAdvice`/`@ExceptionHandler` global renvoyant un message générique structuré, jamais la stack trace brute.

## Injections
- Spring Data JPA (`Repository`) ou requêtes paramétrées (`@Query` avec `:param`, `PreparedStatement`) — jamais de concaténation de chaîne dans une requête JPQL/SQL native.

## Authentification & autorisation
- Spring Security pour l'authentification (JWT, OAuth2/OIDC selon le besoin) plutôt qu'un filtre fait maison.
- Hachage des mots de passe via `BCryptPasswordEncoder` (ou `Argon2PasswordEncoder`) fourni par Spring Security — jamais de hash maison.
- `@PreAuthorize`/`@PostAuthorize` ou vérifications explicites d'ownership sur les endpoints sensibles — ne pas se limiter à `@Secured`/authentification globale (IDOR).
- Limiter les tentatives de connexion (compteur d'échecs en base/cache + verrouillage temporaire, ou `Bucket4j` pour le rate limiting sur l'endpoint de login).

## CSRF / CORS
- CSRF activé par défaut pour les sessions basées cookie (formulaires web) ; pour une API stateless en JWT, le désactiver explicitement et consciemment (`.csrf(csrf -> csrf.disable())`) seulement si aucune session cookie n'est utilisée, en le documentant.
- Configurer `CorsConfigurationSource` avec une whitelist explicite d'origines — jamais `allowedOrigins("*")` avec `allowCredentials(true)`.

## Uploads
- Limiter `spring.servlet.multipart.max-file-size` / `max-request-size` explicitement.
- Vérifier le type MIME réel du contenu (ex. Apache Tika) en plus du `Content-Type` déclaré.
- Stocker hors du classpath/répertoire servi statiquement, avec un nom généré (UUID).

## Dépendances
- `pom.xml`/`build.gradle` avec versions gérées (BOM Spring Boot) ; utiliser `mvn dependency:check` ou l'OWASP Dependency-Check plugin pour détecter les CVE connues.
