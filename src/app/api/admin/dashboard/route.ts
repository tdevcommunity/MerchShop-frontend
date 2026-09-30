import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { dashboardSnapshot } from "@/server/shop-store";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const { searchParams } = new URL(request.url);
  return NextResponse.json(
    dashboardSnapshot({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    }),
  );
}
