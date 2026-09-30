import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { listPayments } from "@/server/shop-store";

export async function GET() {
  const auth = await requireAdmin("payments");
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(listPayments());
}
