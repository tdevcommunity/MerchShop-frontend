import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch, laravelList } from "@/server/laravel";

function toAdminCategory(category: Record<string, unknown>) {
  return {
    id: String(category.id ?? category.uuid ?? ""),
    slug: String(category.slug ?? ""),
    label: String(category.label ?? category.name ?? ""),
    active: category.active ?? (category.status === 1 || category.status === "active"),
    sortOrder: Number(category.sortOrder ?? 0),
  };
}

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
        body: {
          ...body,
          name: body.name ?? body.label,
          status: body.status === "active" || body.active === true ? 1 : body.status ?? 0,
        },
      }),
    );
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
