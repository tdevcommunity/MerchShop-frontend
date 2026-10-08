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

function appendFields(form: FormData, value: unknown, key: string) {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => appendFields(form, item, `${key}[${index}]`));
  } else if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) =>
      appendFields(form, childValue, `${key}[${childKey}]`),
    );
  } else {
    form.append(key, String(value));
  }
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
    let body: Record<string, unknown>;
    let image: File | undefined;
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      body = JSON.parse(String(form.get("payload") ?? "{}")) as Record<string, unknown>;
      const candidate = form.get("image");
      image = candidate instanceof File ? candidate : undefined;
    } else {
      body = (await request.json().catch(() => null)) as Record<string, unknown>;
    }
    const payload = toLaravelProductPayload(body);
    if (image) {
      const multipart = new FormData();
      Object.entries(payload).forEach(([key, value]) => appendFields(multipart, value, key));
      multipart.append("_method", "PUT");
      multipart.append("image", image, image.name);
      return NextResponse.json(
        await laravelFetch(request, `/api/v1/products/${id}`, {
          method: "POST",
          body: multipart,
        }),
      );
    }
    return NextResponse.json(
      await laravelFetch(request, `/api/v1/products/${id}`, {
        method: "PUT",
        body: payload,
      }),
    );
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
