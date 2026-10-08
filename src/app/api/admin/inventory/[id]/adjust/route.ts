import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => null)) as unknown;
    return NextResponse.json(
      await laravelFetch(request, `/api/v1/admin/inventory/${id}/adjust`, {
        method: "POST",
        body,
      }),
    );
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
