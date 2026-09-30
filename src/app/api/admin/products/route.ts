import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import { createProduct, listAdminProducts } from "@/server/shop-store";

export async function GET() {
  const auth = await requireAdmin("catalog");
  if (auth.error) {
    return auth.error;
  }
  return NextResponse.json(listAdminProducts());
}

export async function POST(request: Request) {
  const auth = await requireAdmin("catalog");
  if (auth.error) {
    return auth.error;
  }
  try {
    const body = await request.json();
    const product = createProduct(auth.user, body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleAdminError(error);
  }
}
