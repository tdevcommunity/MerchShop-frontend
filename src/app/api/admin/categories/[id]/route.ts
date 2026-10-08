import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown>;
    return NextResponse.json(
      await laravelFetch(request, `/api/v1/categories/${id}`, {
        method: "PUT",
        body: {
          ...body,
          name: body.name ?? body.label,
          status: body.status === "active" || body.active === true ? 1 : body.status,
        },
      }),
    );
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
