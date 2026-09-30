import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { updateCategory } from "@/server/shop-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("catalog");
  if (auth.error) {
    return auth.error;
  }
  try {
    const { id } = await params;
    const body = await request.json();
    return NextResponse.json(updateCategory(auth.user, id, body));
  } catch (error) {
    return handleAdminError(error);
  }
}
