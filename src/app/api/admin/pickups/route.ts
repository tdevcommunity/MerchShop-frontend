import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { listPickups } from "@/server/shop-store";

export async function GET() {
  const auth = await requireAdmin("pickups");
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(listPickups());
}
