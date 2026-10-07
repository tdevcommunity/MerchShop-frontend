import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const sp = new URL(request.url).searchParams;
    const search: Record<string, string> = {};
    const from = sp.get("from");
    const to = sp.get("to");
    if (from) search["from"] = from;
    if (to) search["to"] = to;
    const data = await laravelFetch(request, "/api/v1/admin/dashboard", { search });
    return NextResponse.json(data);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
