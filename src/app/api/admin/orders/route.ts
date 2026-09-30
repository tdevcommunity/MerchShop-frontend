import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-http";
import { listAdminOrders } from "@/server/shop-store";

export async function GET(request: Request) {
  const auth = await requireAdmin("orders");
  if (auth.error) {
    return auth.error;
  }
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim().toLowerCase();
  const status = params.get("status") ?? "";
  const payment = params.get("payment") ?? "";
  const fulfillment = params.get("fulfillment") ?? "";
  const product = (params.get("product") ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(10, Number(params.get("pageSize") ?? 20)));

  const filtered = listAdminOrders().filter((order) => {
    if (status && order.status !== status) {
      return false;
    }
    if (payment && order.paymentStatus !== payment) {
      return false;
    }
    if (fulfillment && order.deliveryMethod !== fulfillment) {
      return false;
    }
    if (product && !order.items.some((item) => item.productName.toLowerCase().includes(product))) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = [
      order.id,
      order.reference,
      order.customer.firstName,
      order.customer.lastName,
      order.customer.email,
      order.customer.phone,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const start = (page - 1) * pageSize;
  return NextResponse.json({
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  });
}
