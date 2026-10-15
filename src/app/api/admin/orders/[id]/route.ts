import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";
import { mapLaravelOrder } from "../mapper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  try {
    const data = await laravelFetch<Record<string, unknown>>(
      request,
      `/api/v1/admin/orders/${id}`,
    );
    /*
     * La fiche commande du back-office attend `{ order, qr }`, comme celle des
     * retraits. Renvoyer la ressource a plat ferait lire `data.order.status` sur
     * `undefined` : c'est exactement l'erreur qui remontait en production.
     */
    return NextResponse.json({ order: mapLaravelOrder(data), qr: null });
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
