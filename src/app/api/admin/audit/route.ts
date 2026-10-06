import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelList } from "@/server/laravel";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const sp = new URL(request.url).searchParams;
    const search: Record<string, string> = {};
    const page = sp.get("page");
    const pageSize = sp.get("pageSize");
    if (page) search["page"] = page;
    if (pageSize) search["pageSize"] = pageSize;
    const result = await laravelList(request, "/api/v1/admin/audit", search);
    return NextResponse.json(result);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
