import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { searchStore } from "@/server/shop-store";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  const query = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json(searchStore(query));
}
