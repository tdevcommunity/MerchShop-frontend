import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { listNotifications, markNotificationsRead } from "@/server/shop-store";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(listNotifications());
}

export async function PATCH() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(markNotificationsRead());
}
