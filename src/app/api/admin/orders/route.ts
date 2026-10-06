import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelList } from "@/server/laravel";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const sp = new URL(request.url).searchParams;
    const search: Record<string, string> = {};
    for (const key of ["page", "pageSize", "q", "status", "payment", "fulfillment", "product"]) {
      const value = sp.get(key);
      if (value) {
        search[key] = value;
      }
    }
    const result = await laravelList(request, "/api/v1/admin/orders", search);
    return NextResponse.json(result);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
