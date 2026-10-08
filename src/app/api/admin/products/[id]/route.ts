import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch } from "@/server/laravel";
import { mapLaravelProduct } from "../mapper";

type Context = { params: Promise<{ id: string }> };

function validUuid(value: unknown) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function toLaravelProductPayload(body: Record<string, unknown>) {
  return {
    ...body,
    category_id: body.category_id == null ? undefined : Number(body.category_id ?? body.category),
    status: body.status === "published" ? 1 : body.status === "active" ? 1 : body.status,
    variants: Array.isArray(body.variants)
      ? body.variants.map((variant) => {
          const item = variant as Record<string, unknown>;
          return {
            uuid: validUuid(item.uuid ?? item.id),
            name: item.name ?? ([item.size, item.color].filter(Boolean).join(" / ") || item.sku),
            sku: item.sku,
            size: item.size ?? null,
            color: item.color ?? null,
            price: item.price ?? item.unitPrice,
            stock: item.stock ?? item.stockQuantity,
            status: item.status === "published" ? 1 : item.status ?? 1,
          };
        })
      : undefined,
  };
}

export async function GET(request: Request, { params }: Context) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    const result = await laravelFetch<{ data?: Record<string, unknown> }>(
      request,
      `/api/v1/products/${id}`,
    );
    return NextResponse.json(result.data ? mapLaravelProduct(result.data) : result);
  } catch (error) {
    return laravelErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as Record<string, unknown>;
    return NextResponse.json(
      await laravelFetch(request, `/api/v1/products/${id}`, {
        method: "PUT",
        body: toLaravelProductPayload(body),
      }),
    );
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
