import { NextResponse } from "next/server";
import { requireAdmin, laravelErrorResponse } from "@/server/admin-session";
import { laravelFetch, laravelList } from "@/server/laravel";
import { mapLaravelProduct } from "./mapper";
import { appendFields, toLaravelProductPayload } from "./payload";

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
    const payload = toLaravelProductPayload(body ?? {}, "create");
    if (image || variantImageFiles.size > 0) {
      const multipart = new FormData();
      Object.entries(payload).forEach(([key, value]) => appendFields(multipart, value, key));
      if (image) multipart.append("image", image, image.name);
      for (const [index, file] of variantImageFiles) {
        multipart.append(`variantImage[${index}]`, file, file.name);
      }
      return NextResponse.json(
        await laravelFetch(request, "/api/v1/products", { method: "POST", body: multipart }),
      );
    }
    return NextResponse.json(
      await laravelFetch(request, "/api/v1/products", {
        method: "POST",
        body: payload,
      }),
    );
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
