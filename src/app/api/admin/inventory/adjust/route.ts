import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const body = (await request.json().catch(() => null)) as unknown;
    const data = await laravelFetch(request, "/api/v1/admin/inventory/adjust", {
      method: "POST",
      body,
    });
    return NextResponse.json(data);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
