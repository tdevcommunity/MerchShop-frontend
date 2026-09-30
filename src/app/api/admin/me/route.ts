import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(auth.user);
}
