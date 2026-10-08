import type { NextResponse } from "next/server";

/**
 * Le marqueur d'acces du back-office.
 *
 * Le middleware doit repondre a une question simple avant de rendre une page
 * `/admin/**` : « quelqu'un s'est-il connecte ? ». Il ne peut pas y repondre en
 * lisant le cookie de session de l'API, et la raison est un nom : ce nom n'est
 * pas le meme partout. Laravel le derive de `SESSION_COOKIE` / `APP_NAME`
 * (`config/session.php` de l'API) — `merchshop-session` en local,
 * `tdev_admin_session` en production. Un middleware qui pose un nom en dur en
 * rate donc la moitie : en production, il ne trouvait jamais son cookie et
 * renvoyait vers la connexion juste apres une connexion reussie. L'ecran
 * retombait sur le formulaire rempli, avec le message « Connexion reussie —
 * redirection… » fige a l'ecran : rien ne redirigeait jamais.
 *
 * C'est le back-office qui pose donc son propre cookie, dont il connait le nom
 * parce qu'il le choisit. Il ne contient aucune donnee : ni role, ni jeton, ni
 * expiration de session. Sa seule lecture est « il existe ou il n'existe pas ».
 *
 * Ce controle ne vaut donc rien a lui seul, et c'est voulu : `requireAdmin`,
 * appele par chaque route `/api/admin/**`, interroge l'API et refuse une session
 * expiree, un compte desactive ou un role insuffisant. Un marqueur forge a la
 * main n'ouvre aucune porte : il donne un tableau de bord dont chaque appel
 * repond 401, et l'ecran ramene a la connexion.
 */
export const ADMIN_ACCESS_COOKIE = "tdev-admin-access";

/**
 * La duree de vie du marqueur.
 *
 * Longue volontairement : elle doit toujours depasser celle de la session de
 * l'API (deux heures, `SESSION_LIFETIME`), sans quoi un guichetier serait
 * renvoye a la connexion pendant que sa session est encore valide. Un marqueur
 * qui survit a la session ne cause rien : l'API repond 401, l'ecran propose de
 * se reconnecter. Une session « remember me » plus longue ferait de meme.
 */
const ADMIN_ACCESS_TTL_SECONDS = 12 * 60 * 60;

/**
 * Un en-tete `Set-Cookie`, ecrit a la main.
 *
 * Volontairement pas `response.cookies.set(...)` : cette API part des cookies
 * deja poses sur la reponse, et les remplace par les siens. Or les cookies de
 * la session viennent d'etre recopies tels quels depuis l'API, par
 * `headers.append` — un `cookies.set` apres eux effacerait la session, et le
 * navigateur ne recevrait que le marqueur. Les deux mecanismes ne se melangent
 * donc pas : tout passe par `headers.append`.
 */
function setCookie(value: string, maxAge: number): string {
  const parts = [
    `${ADMIN_ACCESS_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  /*
   * `Secure` suit le protocole reellement servi : en production c'est HTTPS, en
   * local du HTTP — un cookie marque `Secure` sur du HTTP est rejete par le
   * navigateur, et le middleware ne verrait rien.
   */
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/** Pose le marqueur apres une connexion que l'API a acceptee. */
export function grantAdminAccess(response: NextResponse): void {
  response.headers.append("Set-Cookie", setCookie("1", ADMIN_ACCESS_TTL_SECONDS));
}

/**
 * Retire le marqueur a la deconnexion.
 *
 * Le middleware ne doit plus voir d'acces la ou la session de l'API vient
 * d'etre fermee : sans cela, la barre laterale resterait atteignable jusqu'a
 * expiration du marqueur, chaque appel repondant 401.
 */
export function revokeAdminAccess(response: NextResponse): void {
  response.headers.append("Set-Cookie", setCookie("", 0));
}
