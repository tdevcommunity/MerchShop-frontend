import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetchEnvelope, laravelList } from "@/server/laravel";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const body = (await request.json().catch(() => null)) as unknown;
    /*
     * Corps complet et non resserré : la reponse porte le mot de passe
     * temporaire a cote du compte, et l'ecran doit pouvoir l'afficher une
     * seule fois. Retirer l'enveloppe ferait disparaitre ce mot de passe au
     * passage.
     */
    const data = await laravelFetchEnvelope(request, "/api/v1/admin/users", {
      method: "POST",
      body,
    });
    return NextResponse.json(data);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const sp = new URL(request.url).searchParams;
    const search: Record<string, string> = {};
    for (const [key, value] of sp.entries()) {
      search[key] = value;
    }
    const result = await laravelList(request, "/api/v1/admin/users", search);
    return NextResponse.json(result);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
