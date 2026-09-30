import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { getAdminOrder, getPickupQrFromStore } from "@/server/shop-store";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("orders");
  if (auth.error) {
    return auth.error;
  }
  const { id } = await params;
  const order = getAdminOrder(id);
  if (!order) {
    return NextResponse.json({ message: "Commande introuvable." }, { status: 404 });
  }
  return NextResponse.json({
    order,
    qr: getPickupQrFromStore(order.id) ?? null,
  });
}
