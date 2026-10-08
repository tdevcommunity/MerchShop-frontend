import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelList } from "@/server/laravel";

/**
 * Le journal des mouvements de stock.
 *
 * Une route a part, et non un drapeau `?history=1` sur `/inventory` comme
 * avant : ce ne sont pas les memes donnees (des declinaisons contre des
 * mouvements), ni la meme permission cote API (`inventory` pour la liste,
 * `audit` pour le journal). Un drapeau les faisait passer pour une seule
 * lecture, et la liste des declinaisons etait servie a la place du journal —
 * d'ou un « Historique » qui affichait des lignes de stock.
 *
 * Le chemin est celui de l'API, `/admin/inventory/adjustments` : il n'y a rien
 * a traduire, donc rien a desynchroniser.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const sp = new URL(request.url).searchParams;
    const search: Record<string, string> = {};
    for (const key of ["page", "pageSize", "variant", "reason", "q"]) {
      const value = sp.get(key);
      if (value) {
        search[key] = value;
      }
    }
    const result = await laravelList(request, "/api/v1/admin/inventory/adjustments", search);
    return NextResponse.json(result);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
