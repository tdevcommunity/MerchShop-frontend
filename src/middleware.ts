import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_COOKIE } from "@/server/admin-access";

/*
 | L'acces au back-office.
 |
 | Ce middleware ferme la porte avant qu'une page `/admin/**` soit rendue. Sa
 | question est « quelqu'un s'est-il connecte ? », et il y repond en lisant le
 | marqueur pose par le back-office (`src/server/admin-access.ts`).
 |
 | Il ne lit pas le cookie de session de l'API, et ce n'est pas un oubli : ce
 | cookie change de nom selon l'environnement — `merchshop-session` en local,
 | `tdev_admin_session` en production, parce que le nom est derive de
 | `SESSION_COOKIE` / `APP_NAME` cote Laravel. Un nom pose en dur ici est donc
 | faux quelque part, et l'erreur est invisible : en production, le middleware
 | ne trouvait jamais son cookie et renvoyait vers la connexion juste apres une
 | connexion reussie. L'ecran retombait sur le formulaire rempli, avec le
 | message « Connexion reussie — redirection… » fige a l'ecran.
 |
 | Ce controle ne pose qu'une question de presence, et c'est suffisant : un
 | marqueur forge n'ouvre rien, puisque `requireAdmin` interroge l'API a chaque
 | route `/api/admin/**` et refuse une session absente, expiree ou sans le role.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const access = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    if (!access) {
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
