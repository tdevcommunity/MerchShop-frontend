import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";
import type { DashboardSnapshot } from "@/types/admin";

/**
 * Reponse de GET /api/v1/admin/dashboard (DashboardService::summary).
 *
 * L'API renvoie des compteurs groupes par domaine, alors que l'ecran attend
 * un instantane a plat (DashboardSnapshot). Tant que les deux contrats ne sont
 * pas alignes, la conversion se fait ici : l'ecran ne doit jamais recevoir un
 * champ absent, sinon il plante sur `salesByDay.map`.
 */
type LaravelDashboard = {
  orders?: { pendingPayment?: number; paid?: number; pickedUp?: number; cancelled?: number };
  revenue?: number;
  inventory?: { outOfStock?: number; lowStock?: number; disabled?: number };
  pickup?: { ready?: number; awaitingPreparation?: number };
};

function toSnapshot(api: LaravelDashboard, from: string, to: string): DashboardSnapshot {
  const orders = api.orders ?? {};
  const pendingOrders = orders.pendingPayment ?? 0;
  const paidOrders = orders.paid ?? 0;
  const pickedUp = orders.pickedUp ?? 0;

  return {
    from,
    to,
    revenue: api.revenue ?? 0,
    orders: pendingOrders + paidOrders + pickedUp + (orders.cancelled ?? 0),
    paidOrders,
    pendingOrders,
    readyForPickup: api.pickup?.ready ?? 0,
    pickedUp,
    // Non fournis par l'API pour l'instant : l'ecran affiche des zeros et des
    // listes vides plutot que de planter.
    activeProducts: 0,
    lowStockProducts: api.inventory?.lowStock ?? 0,
    salesByDay: [],
    topProducts: [],
    lowStock: [],
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const sp = new URL(request.url).searchParams;
    const search: Record<string, string> = {};
    const from = sp.get("from") ?? "";
    const to = sp.get("to") ?? "";
    if (from) search["from"] = from;
    if (to) search["to"] = to;
    const data = await laravelFetch<LaravelDashboard>(request, "/api/v1/admin/dashboard", { search });
    return NextResponse.json(toSnapshot(data ?? {}, from, to));
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
