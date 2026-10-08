import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";

type BackendDashboard = {
  orders?: {
    pendingPayment?: number;
    paid?: number;
    pickedUp?: number;
    cancelled?: number;
  };
  revenue?: number;
  inventory?: {
    outOfStock?: number;
    lowStock?: number;
    disabled?: number;
  };
  pickup?: {
    ready?: number;
    awaitingPreparation?: number;
  };
};

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const sp = new URL(request.url).searchParams;
    const search: Record<string, string> = {};
    const from = sp.get("from");
    const to = sp.get("to");
    if (from && to) {
      const start = new Date(`${from}T00:00:00Z`).getTime();
      const end = new Date(`${to}T00:00:00Z`).getTime();
      const days = Number.isFinite(start) && Number.isFinite(end)
        ? Math.max(1, Math.floor((end - start) / 86_400_000) + 1)
        : 1;
      search.failures_days = String(days);
    }

    const backend = await laravelFetch<BackendDashboard>(
      request,
      "/api/v1/admin/dashboard",
      { search },
    );
    const orders = backend.orders ?? {};
    const inventory = backend.inventory ?? {};
    const pickup = backend.pickup ?? {};

    return NextResponse.json({
      from: from ?? "",
      to: to ?? "",
      revenue: backend.revenue ?? 0,
      orders: (orders.pendingPayment ?? 0) + (orders.paid ?? 0) +
        (orders.pickedUp ?? 0) + (orders.cancelled ?? 0),
      paidOrders: orders.paid ?? 0,
      pendingOrders: orders.pendingPayment ?? 0,
      readyForPickup: pickup.ready ?? 0,
      pickedUp: orders.pickedUp ?? 0,
      activeProducts: 0,
      lowStockProducts: inventory.lowStock ?? 0,
      salesByDay: [],
      topProducts: [],
      lowStock: [],
    });
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
