import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    return NextResponse.json(
      await laravelFetch(request, `/api/v1/admin/pickups/${id}/validate`, { method: "POST" }),
    );
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
