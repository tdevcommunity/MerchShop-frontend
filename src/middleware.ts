import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/*
 | Le cookie de session pose par l'API.
 |
 | Le back-office ne cree aucun jeton local : la connexion relaie ceux de
 | Laravel, dont le nom de session est derive de `SESSION_COOKIE` / `APP_NAME`
 | (`config/session.php` de l'API, ici `MerchShop` -> `merchshop-session`).
 |
 | Verifier un nom qui n'existe pas — un nom suppose, comme `tdev_admin_session`
 | — revient a laisser passer tout le monde : le middleware renvoyait vers la
 | connexion juste apres une connexion reussie, donc l'ecran retombait sur le
 | formulaire sans message, et la saisie semblait ne servir a rien.
 |
 | Ce controle ne pose qu'une question de presence : un middleware ne peut pas
 | valider une session chiffree. L'autorite reste `requireAdmin`, appele par
 | chaque route `/api/admin/**`, qui interroge l'API et refuse une session
 | expiree ou un role insuffisant.
 */
const SESSION_COOKIE = "merchshop-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
