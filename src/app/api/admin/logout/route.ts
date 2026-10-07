import { NextResponse } from "next/server";
import { laravelLogout } from "@/server/laravel";

/**
 * La deconnexion.
 *
 * La session a ete ouverte par l'API, donc c'est l'API qui la ferme. Le
 * back-office ne peut pas « oublier » la session : il n'en tient pas de copie,
 * et un cookie qu'il supprimerait de son propre chef ne serait qu'un second
 * cookie — celui-la serait repose par le navigateur a chaque reponse de l'API.
 *
 * Une deconnexion qui reussit cote back-office et reussit cote API laisse deux
 * possibilites seulement : soit l'API a repondu, et ses cookies de suppression
 * sont renvoyes, soit elle n'a pas repondu et la session est encore ouverte —
 * auquel cas mentir en renvoyant « ok » ferait croire a l'echantillon qu'il est
 * deconnecte alors qu'il suffit de revenir sur la page.
 */
export async function POST(request: Request) {
  try {
    const setCookies = await laravelLogout(request);

    const response = NextResponse.json({ ok: true });

    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "La déconnexion n'a pas abouti." },
      { status: 502 },
    );
  }
}
