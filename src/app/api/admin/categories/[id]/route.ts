import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";
import { toAdminCategory, toUpdateCategoryPayload } from "../mapper";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    const body = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const updated = await laravelFetch<Record<string, unknown>>(
      request,
      `/api/v1/categories/${id}`,
      {
        method: "PUT",
        body: toUpdateCategoryPayload(body),
      },
    );
    return NextResponse.json(toAdminCategory(updated));
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
