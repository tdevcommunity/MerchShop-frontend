import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetchEnvelope } from "@/server/laravel";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  try {
    const body = (await request.json().catch(() => null)) as unknown;
    /*
     * Corps complet : la reponse porte le mot de passe temporaire a cote du
     * compte, et l'ecran doit pouvoir l'afficher une seule fois — c'est tout
     * l'objet de cette action.
     */
    const data = await laravelFetchEnvelope(
      request,
      `/api/v1/admin/users/${id}/reset-password`,
      {
        method: "POST",
        body,
      },
    );
    return NextResponse.json(data);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
