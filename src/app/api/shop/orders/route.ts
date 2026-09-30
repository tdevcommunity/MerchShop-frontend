import { NextResponse } from "next/server";
import { useMockApi } from "@/lib/config/env";
import { recordPaidOrder } from "@/server/shop-store";
import type { CartItem } from "@/types/cart";
import type { CustomerInfo } from "@/types/checkout";
import type { DeliveryMethod, ShippingAddress } from "@/types/delivery";
import type { Order } from "@/types/order";
import type { PaymentMethod } from "@/types/payment";

type Body = {
  items: CartItem[];
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  shippingAddress: ShippingAddress | null;
  paymentMethod: PaymentMethod | null;
};

export async function POST(request: Request) {
  if (!useMockApi) {
    return NextResponse.json({ message: "Endpoint mock désactivé." }, { status: 404 });
  }
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.items?.length || !body.customer || !body.deliveryMethod) {
    return NextResponse.json({ message: "Commande incomplète." }, { status: 400 });
  }

  const id = `ord_mock_${Date.now()}`;
  const order: Order = {
    id,
    reference: `TDEV-${id.slice(-6).toUpperCase()}`,
    status: "paid",
    items: body.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantLabel: item.variantLabel,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    total: body.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    paymentStatus: "success",
    paymentMethod: body.paymentMethod,
    customer: body.customer,
    deliveryMethod: body.deliveryMethod,
    shippingAddress: body.shippingAddress,
    pickupLabel: body.deliveryMethod === "pickup_event" ? "Stand Merch — Village TDEV" : null,
    createdAt: new Date().toISOString(),
  };

  recordPaidOrder(order, body.paymentMethod);
  return NextResponse.json(order, { status: 201 });
}
