import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { listAdminUsers } from "@/server/shop-store";

export async function GET() {
  const auth = await requireAdmin("users");
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(listAdminUsers());
}
