import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { listAuditLogs } from "@/server/shop-store";

export async function GET() {
  const auth = await requireAdmin("audit");
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(listAuditLogs());
}
