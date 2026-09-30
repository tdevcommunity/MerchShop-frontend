import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { listInventory, listInventoryLogs } from "@/server/shop-store";

export async function GET(request: Request) {
  const auth = await requireAdmin("inventory");
  if (auth.error) {
    return auth.error;
  }
  const history = new URL(request.url).searchParams.get("history") === "1";
  return NextResponse.json(history ? listInventoryLogs() : listInventory());
}
