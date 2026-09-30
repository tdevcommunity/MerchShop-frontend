import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { createCategory, listCategories } from "@/server/shop-store";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(listCategories());
}

export async function POST(request: Request) {
  const auth = await requireAdmin("catalog");
  if (auth.error) {
    return auth.error;
  }
  try {
    const body = await request.json();
    return NextResponse.json(createCategory(auth.user, body), { status: 201 });
  } catch (error) {
    return handleAdminError(error);
  }
}
