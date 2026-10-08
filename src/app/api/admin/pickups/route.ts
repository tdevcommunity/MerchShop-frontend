import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelList } from "@/server/laravel";
import { mapLaravelOrder } from "../orders/mapper";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const result = await laravelList<Record<string, unknown>>(request, "/api/v1/pickup/orders");
    return NextResponse.json({
      data: result.data.map((order) => ({ order: mapLaravelOrder(order), qr: null })),
      meta: result.meta,
    });
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
