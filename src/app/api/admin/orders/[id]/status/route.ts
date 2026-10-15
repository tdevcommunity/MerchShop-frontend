import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";
import { mapLaravelOrder } from "../../mapper";

export async function PATCH(
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
    const data = await laravelFetch<Record<string, unknown>>(
      request,
      `/api/v1/admin/orders/${id}/status`,
      {
        method: "PATCH",
        body,
      },
    );
    /*
     * La fiche remplace son `order` par ce que renvoie cette route : elle doit
     * donc recevoir la meme forme que la lecture, statut converti compris.
     */
    return NextResponse.json(mapLaravelOrder(data));
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
