import { NextResponse } from "next/server";
import { laravelFetch, laravelLogin, LaravelError } from "@/server/laravel";
import { unauthenticated } from "@/server/admin-session";

/**
 * La connexion du back-office.
 *
 * Elle ne verifie rien elle-meme : elle transmet les identifiants a l'API et
 * renvoie ce que l'API a pose. Le role n'est pas verifie ici non plus, et c'est
 * deliberé — la page d'accueil du back-office verifie le role a chaque appel, et
 * un client qui se connecte avec succes sans etre du merch ne peut rien voir de
 * plus que s'il ne s'etait jamais connecte.
 *
 * Refuser ici un role non back-office donnerait au guichetier un message « vous
 * n'etes pas du stand » sur une connexion reussie, ce qui est une information
 * qu'il n'a pas besoin d'avoir et que l'API, elle, ne donne pas non plus. Le
 * back-office affiche donc la meme erreur qu'une session absente, ce qui est
 * aussi la moins trompeuse : « connecte-toi » reste la seule action proposee.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;

  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Renseignez ton email et ton mot de passe." },
      { status: 422 },
    );
  }

  let setCookies: string[];

  try {
    ({ setCookies } = await laravelLogin(request, { email, password }));
  } catch (error) {
    /*
     * Les identifiants errones rendent la meme reponse que l'absence de compte,
     * et c'est la regle de l'API, reprise telle quelle : distinguer « ce compte
     * n'existe pas » de « ce mot de passe est faux » confirmerait a qui essaie
     * que l'adresse existe.
     *
     * Le statut est 401 et non le 422 de l'API : pour l'ecran, ce sont deux
     * lectures de la meme situation, et « connecte-toi » est la seule action
     * utile dans les deux cas.
     */
    if (error instanceof LaravelError && error.status === 422) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect." },
        { status: 401 },
      );
    }

    if (error instanceof LaravelError) {
      return NextResponse.json(
        { message: error.message, code: error.code, details: error.details },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "Connexion impossible." },
      { status: 502 },
    );
  }

  /*
   * Les cookies sont renvoyes tels quels.
   *
   * La session est posee par l'API et c'est elle qui en decrit les attributs :
   * `HttpOnly`, `SameSite`, la duree. Les recopier ici obligerait a reproduire
   * ces trois regles a l'identique et a les tenir a jour dans deux endroits,
   * dont un qui n'a aucune raison d'exister. Le back-office transmet.
   */
  const response = NextResponse.json({ ok: true });

  for (const cookie of setCookies) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}

/**
 * La session en cours, pour un client qui veut savoir ou il en est.
 *
 * L'ecran ne s'en sert pas pour decider quoi afficher — il se fie aux reponses
 * de chaque page — mais pour ne pas proposer une connexion a quelqu'un qui en a
 * deja une.
 */
export async function GET(request: Request) {
  try {
    return NextResponse.json(await laravelFetch<unknown>(request, "/api/v1/auth/me"));
  } catch {
    return unauthenticated();
  }
}