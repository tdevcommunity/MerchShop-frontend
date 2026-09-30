import { NextResponse } from "next/server";
import { handleAdminError, requireAdmin } from "@/server/admin-http";
import {
  duplicateProduct,
  getAdminProduct,
  updateProduct,
} from "@/server/shop-store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const auth = await requireAdmin("catalog");
  if (auth.error) {
    return auth.error;
  }
  const { id } = await params;
  const product = getAdminProduct(id);
  if (!product) {
    return NextResponse.json({ message: "Produit introuvable." }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin("catalog");
  if (auth.error) {
    return auth.error;
  }
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.duplicate) {
      return NextResponse.json(duplicateProduct(auth.user, id), { status: 201 });
    }
    return NextResponse.json(updateProduct(auth.user, id, body));
  } catch (error) {
    return handleAdminError(error);
  }
}
