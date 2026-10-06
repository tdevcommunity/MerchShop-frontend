import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  try {
    const data = await laravelFetch(request, `/api/v1/admin/orders/${id}`);
    return NextResponse.json(data);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
