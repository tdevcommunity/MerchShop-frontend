import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch, laravelList } from "@/server/laravel";
import { toAdminCategory, toLaravelCategoryCreatePayload } from "./mapper";

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
    const body = (await request.json().catch(() => null)) as Record<string, unknown>;
    return NextResponse.json(
      await laravelFetch(request, "/api/v1/categories", {
        method: "POST",
        body: toLaravelCategoryCreatePayload(body ?? {}),
      }),
    );
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
