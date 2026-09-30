import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { changeOrderStatus } from "@/server/shop-store";
import type { OrderStatus } from "@/types/order";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("orderStatus");
  if (auth.error) {
    return auth.error;
  }
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: OrderStatus };
    if (!body.status) {
      return NextResponse.json({ message: "Statut manquant." }, { status: 400 });
    }
    return NextResponse.json(changeOrderStatus(auth.user, id, body.status));
  } catch (error) {
    return handleAdminError(error);
  }
}
