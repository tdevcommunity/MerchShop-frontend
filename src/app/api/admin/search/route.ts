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
    const q = sp.get("q");
    if (q) {
      search["q"] = q;
    }
    const data = await laravelFetch(request, "/api/v1/admin/search", { search });
    return NextResponse.json(data);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
