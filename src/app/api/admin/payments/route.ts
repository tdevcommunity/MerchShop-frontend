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
    for (const [key, value] of sp.entries()) {
      search[key] = value;
    }
    const result = await laravelList<Record<string, unknown>>(
      request,
      "/api/v1/admin/payments",
      search,
    );
    return NextResponse.json({
      ...result,
      data: result.data.map((payment) => ({
        ...payment,
        id: String(payment.uuid ?? payment.id ?? ""),
        providerRef: payment.transactionId ?? null,
        customerName: "",
        createdAt: String(payment.createdAt ?? ""),
      })),
    });
  } catch (error) {
    return laravelErrorResponse(error);
  }
}
