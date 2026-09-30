import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { adjustInventory } from "@/server/shop-store";
import type { InventoryReason } from "@/types/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin("inventoryAdjust");
  if (auth.error) {
    return auth.error;
  }
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      delta?: number;
      reason?: InventoryReason;
      note?: string;
    };
    if (typeof body.delta !== "number" || !body.reason) {
      return NextResponse.json(
        { message: "Variation et motif requis." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      adjustInventory(auth.user, id, body.delta, body.reason, body.note),
    );
  } catch (error) {
    return handleAdminError(error);
  }
}
