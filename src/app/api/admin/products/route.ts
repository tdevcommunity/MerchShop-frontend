import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch, laravelList } from "@/server/laravel";
import { mapLaravelProduct } from "./mapper";

function validUuid(value: unknown) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function toLaravelProductPayload(body: Record<string, unknown>) {
  const status =
    body.status === "published" || body.status === "active"
      ? 1
      : body.status === "draft" || body.status === "archived" || body.status === "inactive"
        ? 0
        : body.status ?? 0;
  const variants = Array.isArray(body.variants)
    ? body.variants.map((variant) => {
        const item = variant as Record<string, unknown>;
        return {
          uuid: validUuid(item.uuid ?? item.id),
          name:
            item.name ??
            ([item.size, item.color].filter(Boolean).join(" / ") || item.sku),
          sku: item.sku,
          size: item.size ?? null,
          color: item.color ?? null,
          image_url: item.image_url ?? item.imageUrl ?? null,
          color_hex: item.color_hex ?? item.colorHex ?? null,
          price: item.price ?? item.unitPrice,
          stock: item.stock ?? item.stockQuantity,
          status: item.status === "published" ? 1 : item.status ?? 1,
        };
      })
    : undefined;

  return {
    ...body,
    category_id: Number(body.category_id ?? body.category),
    status,
    variants,
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

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const searchParams = new URL(request.url).searchParams;
    const search: Record<string, string> = {};
    for (const key of ["page", "pageSize", "q", "status", "category"]) {
      const value = searchParams.get(key);
      if (value) search[key] = value;
    }
    const result = await laravelList<Record<string, unknown>>(request, "/api/v1/products", search);
    return NextResponse.json({
      ...result,
      data: result.data.map(mapLaravelProduct),
    });
  } catch (error) {
    return laravelErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    let body: Record<string, unknown>;
    let image: File | undefined;
    const variantImageFiles = new Map<number, File>();
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      body = JSON.parse(String(form.get("payload") ?? "{}")) as Record<string, unknown>;
      const candidate = form.get("image");
      image = candidate instanceof File ? candidate : undefined;
      for (const [key, value] of form.entries()) {
        const match = /^variantImage\[(\d+)\]$/.exec(key);
        if (match && value instanceof File) {
          variantImageFiles.set(Number(match[1]), value);
        }
      }
    } else {
      body = (await request.json().catch(() => null)) as Record<string, unknown>;
    }
    const payload = toLaravelProductPayload(body);
    let created: Record<string, unknown>;

    if (image || variantImageFiles.size > 0) {
      const multipart = new FormData();
      Object.entries(payload).forEach(([key, value]) => appendFields(multipart, value, key));
      if (image) multipart.append("image", image, image.name);
      for (const [index, file] of variantImageFiles) {
        multipart.append(`variantImage[${index}]`, file, file.name);
      }
      created = await laravelFetch<Record<string, unknown>>(request, "/api/v1/products", {
        method: "POST",
        body: multipart,
      });
    } else {
      created = await laravelFetch<Record<string, unknown>>(request, "/api/v1/products", {
        method: "POST",
        body: payload,
      });
    }

    /*
     * La reponse d'ecriture subit la meme traduction que la liste. L'API rend
     * `image_url`, `uuid` et un statut entier ; l'ecran lit `AdminProduct` —
     * `imageUrl`, `id`, `status: "published"`. Sans cette passe, toute ligne
     * remplacee par la reponse perdait sa vignette, son nom et son badge au
     * moment meme ou l'on changeait ce statut.
     */
    return NextResponse.json(mapLaravelProduct(created));
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
