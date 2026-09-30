import { NextResponse } from "next/server";
import { useMockApi } from "@/lib/config/env";
import { getAdminOrder, getPickupQrFromStore } from "@/server/shop-store";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!useMockApi) {
    return NextResponse.json({ message: "Endpoint mock désactivé." }, { status: 404 });
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
