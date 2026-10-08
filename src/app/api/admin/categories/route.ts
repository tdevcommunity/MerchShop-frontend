import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch, laravelList } from "@/server/laravel";
import { toAdminCategory, toStoreCategoryPayload } from "./mapper";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const result = await laravelList<Record<string, unknown>>(request, "/api/v1/categories");
    return NextResponse.json({
      ...result,
      data: result.data.map(toAdminCategory),
    });
  } catch (error) {
    return laravelErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const body = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const created = await laravelFetch<Record<string, unknown>>(request, "/api/v1/categories", {
      method: "POST",
      body: toStoreCategoryPayload(body),
    });
    return NextResponse.json(toAdminCategory(created));
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
