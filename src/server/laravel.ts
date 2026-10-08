import { env } from "@/lib/config/env";

/**
 * Le lien entre le back-office et l'API.
 *
 * Toutes les routes `/api/admin/**` passent par ici. Aucune ne parle a Laravel
 * directement, et aucune ne lit la base : la raison est la session.
 *
 * Laravel authentifie par cookie — `merchshop-session`, HttpOnly, `SameSite=lax`
 * — et refuse toute ecriture sans jeton anti-CSRF. Un cookie se transmet d'un
 * navigateur a un serveur, pas d'un serveur a un autre : le back-office ne peut
 * donc pas appeler l'API « au nom » du client sans lui transmettre la session.
 *
 * Ce module est donc un mandataire transparent : il transmet tous les cookies
 * dans les deux sens, et rien d'autre.
 *
 * « Tous », et non « les deux connus », parce que le nom des cookies de session
 * n'est pas stable. Laravel chiffre le contenu de la session et pose un cookie
 * par nom, chaque nom etant un segment aleatoire derive de la cle de
 * l'application ; a la connexion, il regenere la session — c'est sa protection
 * contre la fixation de session — donc le nom change, et pas toujours de la meme
 * facon. Un mandataire qui filtrerait les cookies par nom transmettrait un
 * cookie sur deux, et l'API verrait une session sans jeton : des 419 sur chaque
 * ecriture, sans aucun rapport avec la saisie.
 *
 * Le cookie anti-CSRF (`XSRF-TOKEN`) est pose par Laravel volontairement lisible
 * par le script, precisement pour transiter entre deux couches. Il est renvoye
 * dans l'en-tete `X-XSRF-TOKEN`, que c'est la forme que Laravel verifie — sans
 * avoir a lire le jeton de session ni a savoir comment le chiffrement est fait.
 *
 * La consequence sur l'architecture est qu'il n'y a pas de session ici. Ni jeton
 * signe, ni table d'utilisateurs, ni copie du role, ni expiration a gerer. Une
 * session d'administration cote Next.js serait une deuxieme source de verite sur
 * « qui est connecte », et les deux sources divergeraient : le temps que la
 * session de l'API expire pendant que la copie locale, elle, tient encore, un
 * guichetier decouvre en revenant d'une pause que son acces est coupe sans avoir
 * rien fait.
 */

/** L'API, sans slash final — les chemins commencent tous par `/`. */
const BASE_URL = env.apiBaseUrl;

/**
 * Erreur remontee quand l'API refuse une requete.
 *
 * Le corps de la reponse est conserve tel quel, et non un message extrait. Les
 * erreurs de l'API portent un code stable et un detail — la liste des valeurs
 * acceptees, le stock disponible, le nom du champ fautif — et c'est ce detail que
 * l'ecran affiche. Extraire un message ici reviendrait a perdre le diagnostic
 * et a le reconstruire cote front, en recopiant une regle qui change deja.
 */
export class LaravelError extends Error {
  readonly status: number;

  readonly code: string;

  readonly details: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details: unknown = null,
  ) {
    super(message);
    this.name = "LaravelError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type LaravelErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
};

/** Ce que `ApiResource` rend a cote des elements, pour une liste paginee. */
export type PageMeta = {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
};

export type Query = Record<string, string | number | boolean | undefined | null>;

type CallOptions = {
  method?: string;
  body?: unknown;
  search?: Query;
};

const EMPTY_PAGE: PageMeta = {
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 0,
};

function isWrite(method: string): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

function toQueryString(search?: Query): string {
  if (!search) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    params.set(key, String(value));
  }

  const query = params.toString();

  return query ? "?" + query : "";
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function toLaravelError(status: number, text: string): LaravelError {
  const parsed = (text ? safeJson(text) : null) as LaravelErrorBody | null;
  const error = parsed?.error;

  return new LaravelError(
    status,
    error?.code ?? "HTTP_ERROR",
    error?.message ?? parsed?.message ?? defaultMessage(status),
    error?.details ?? null,
  );
}

/**
 * Un message pour un statut sans corps derriere.
 *
 * Le 419 a sa propre ligne parce que c'est le seul statut dont la cause est
 * toujours la meme et toujours du cote du client : la session a expire, ou la
 * session a change entre la lecture du jeton et l'ecriture — ce qui arrive a
 * chaque connexion, puisque la connexion regenere la session. Le dire crament
 * evite qu'un guichetier cherche un bug dans le formulaire alors que son
 * session a simplement change.
 */
function defaultMessage(status: number): string {
  if (status === 419) {
    return "La session a changé. Reconnecte-toi et réessaie.";
  }

  if (status >= 500) {
    return "Le serveur n'a pas pu traiter la demande.";
  }

  return "La demande a été refusée.";
}

/** Le cookie anti-CSRF, extrait d'un en-tete `Cookie` du navigateur. */
function csrfFromCookieHeader(header: string | null): string | undefined {
  if (!header) {
    return undefined;
  }

  for (const part of header.split(";")) {
    const index = part.indexOf("=");

    if (index < 0) {
      continue;
    }

    const name = part.slice(0, index).trim();

    if (name === "XSRF-TOKEN") {
      // Le navigateur encode le cookie en pour-cent : Laravel a besoin de la
      // valeur brute, sinon la comparaison avec le cookie qu'il a lui-meme
      // echoue et l'ecriture part en 419.
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }

  return undefined;
}

/**
 * Le jeton anti-CSRF dans un en-tete `Set-Cookie` de l'API.
 *
 * Necessaire pour la connexion, ou le navigateur n'a encore aucun cookie : le
 * jeton doit donc etre lu sur ce que l'API vient de poser, et non sur ce qu'elle
 * avait recu.
 */
function csrfFromSetCookies(cookies: string[]): string | undefined {
  for (const cookie of cookies) {
    const pair = cookie.split(";", 1)[0] ?? "";
    const index = pair.indexOf("=");

    if (index < 0) {
      continue;
    }

    if (pair.slice(0, index).trim() === "XSRF-TOKEN") {
      return decodeURIComponent(pair.slice(index + 1).trim());
    }
  }

  return undefined;
}

type RawResponse = {
  body: unknown;
  setCookies: string[];
};

async function call(
  request: Request,
  path: string,
  options: CallOptions & { cookieHeader?: string; csrf?: string } = {},
): Promise<RawResponse> {
  const method = (options.method ?? "GET").toUpperCase();

  /*
   * Le cookie transmis est celui de la requete du navigateur, ou celui de
   * l'echange precedent — ce dernier compte pour la connexion, qui doit
   * pouvoir s'appuyer sur la session fraichement ouverte par `csrf-token`.
   */
  const cookieHeader = options.cookieHeader ?? request.headers.get("cookie");

  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const csrf = options.csrf ?? csrfFromCookieHeader(cookieHeader);

  /*
   * Le jeton n'est joint qu'aux ecritures. Laravel exempte les lectures, et
   * envoyer le jeton quand il n'est pas demande n'apporte rien : au mieux
   * inutile, au pire il ferait echouer une lecture legitime sur une session
   * dont le jeton a change.
   */
  if (isWrite(method) && csrf) {
    headers["X-XSRF-TOKEN"] = csrf;
  }

  const response = await fetch(BASE_URL + path + toQueryString(options.search), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    /*
     * Jamais de cache sur une reponse d'authentification : le cache HTTP ignore
     * les cookies, donc deux guichetiers consecutifs se partageraient la
     * session du precedent.
     */
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw toLaravelError(response.status, text);
  }

  return { body: text ? safeJson(text) : null, setCookies: response.headers.getSetCookie() };
}

/**
 * Le `data` d'une reponse, qu'elle soit enveloppee ou non.
 *
 * `ApiResource` enveloppe toujours sous `data`, mais certaines routes rendent un
 * objet nu, et une liste paginee ajoute `meta` a cote. Lire la clef quand elle
 * existe, et rendre le corps tel quel sinon, evite qu'une de ces formes se
 * presente comme un `undefined` que l'appelant mettrait en cache.
 */
function readData<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }

  return body as T;
}

/**
 * Un appel a l'API, avec la session du navigateur.
 *
 * `body` est serialise ici : aucun appelant ne doit avoir a se souvenir de
 * `JSON.stringify`, et surtout aucun ne doit pouvoir le passer en chaine en
 * croyant que cela passe — ce qui enverrait le champ tel quel, sans forme.
 *
 * Les `Set-Cookie` ne sont pas renvoyes : ici la session existe deja, donc
 * l'API n'a rien de neuf a dire au navigateur, et recopier ses cookies
 * remplacerait un cookie valide par un copie — un gain nul pour un risque de
 * perte.
 */
export async function laravelFetch<T>(
  request: Request,
  path: string,
  options: CallOptions = {},
): Promise<T> {
  const { body } = await call(request, path, options);

  return readData<T>(body);
}

/**
 * Un appel a l'API, corps rendu tel quel — enveloppe `data` comprise.
 *
 * `laravelFetch` retire l'enveloppe, ce qui convient a une ressource seule et
 * non a une reponse qui porte un second message a cote : l'invitation d'un
 * compte renvoie le compte sous `data` ET le mot de passe temporaire a cote.
 * L'enveloppe retiree emporterait le mot de passe avec elle, et
 * l'administrateur n'aurait plus rien a transmettre.
 */
export async function laravelFetchEnvelope<T>(
  request: Request,
  path: string,
  options: CallOptions = {},
): Promise<T> {
  const { body } = await call(request, path, options);

  return body as T;
}

/**
 * Une liste, avec sa pagination.
 *
 * Le nombre de pages n'est pas un detail d'affichage : une liste paginee rend
 * par defaut une seule page, donc un ecran qui affiche « page 1 » sans lire la
 * pagination donne l'illusion d'avoir tout vu. Le `meta` est donc renvoye avec
 * les elements, toujours.
 */
export async function laravelList<T>(
  request: Request,
  path: string,
  search?: Query,
): Promise<{ data: T[]; meta: PageMeta }> {
  const { body } = await call(request, path, { search });
  const payload = (body ?? {}) as { data?: T[]; meta?: PageMeta };

  return { data: payload.data ?? [], meta: payload.meta ?? EMPTY_PAGE };
}

/**
 * La connexion, et les cookies qu'elle doit renvoyer au navigateur.
 *
 * L'ordre des operations est impose par Laravel, et il merite d'etre dit : la
 * connexion est une ecriture, donc elle exige un jeton anti-CSRF, donc il faut
 * deja avoir une session — et c'est la premiere operation. D'ou les deux etapes.
 *
 * `csrf-token` est la seule route que l'on appelle sans avoir de cookie, et elle
 * est explicitement exempte de verification pour cette raison. Elle ouvre une
 * session vide ; la connexion, avec son jeton, regenere cette session et la
 * rend authentifiee.
 *
 * Les cookies sont renvoyes dans cet ordre — ceux de `csrf-token` d'abord,
 * ceux de la connexion ensuite. C'est le seul ordre correct : les deux reponses
 * posent un cookie de session, et le navigateur garde le dernier. Inverser les
 * deux renverrait la session vide juste apres l'authentifiee, et le guichetier
 * serait renvoye vers la page de connexion alors que son compte est valide.
 */
export async function laravelLogin(
  request: Request,
  credentials: { email: string; password: string; remember?: boolean },
): Promise<{ setCookies: string[] }> {
  const bootstrap = await call(request, "/api/v1/auth/csrf-token");

  const login = await call(request, "/api/v1/auth/login", {
    method: "POST",
    body: credentials,
    cookieHeader: mergeCookies(bootstrap.setCookies, request.headers.get("cookie")),
    csrf: csrfFromSetCookies(bootstrap.setCookies),
  });

  return { setCookies: [...bootstrap.setCookies, ...login.setCookies] };
}

/** La deconnexion. Meme exigence : la session a ete ouverte ici, elle finit ici. */
export async function laravelLogout(request: Request): Promise<string[]> {
  const { setCookies } = await call(request, "/api/v1/auth/logout", {
    method: "POST",
  });

  return setCookies;
}

/**
 * Deux lots de cookies rendus en un seul en-tete `Cookie`.
 *
 * `Cookie` est un en-tete a valeurs multiples et le navigateur n'a pas de notion
 * d'ordre entre deux requetes : c'est donc le back-office qui doit les réunir
 * avant de parler a l'API. Les valeurs de `bootstrap` priment, parce que ce
 * sont les plus recentes — c'est la session ouverte par `csrf-token` que la
 * connexion doit utiliser.
 */
function mergeCookies(fromApi: string[], fromBrowser: string | null): string {
  const pairs = new Map<string, string>();

  for (const pair of fromBrowser?.split(";") ?? []) {
    const trimmed = pair.trim();

    if (trimmed) {
      pairs.set(trimmed.slice(0, trimmed.indexOf("=")), trimmed);
    }
  }

  for (const cookie of fromApi) {
    const pair = cookie.split(";", 1)[0];

    if (pair) {
      pairs.set(pair.slice(0, pair.indexOf("=")), pair);
    }
  }

  return [...pairs.values()].join("; ");
}
