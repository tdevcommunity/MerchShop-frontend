import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { validatePickup } from "@/server/shop-store";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("pickups");
  if (auth.error) {
    return auth.error;
  }
  try {
    const { id } = await params;
    return NextResponse.json(validatePickup(auth.user, id));
  } catch (error) {
    return handleAdminError(error);
  }
}
