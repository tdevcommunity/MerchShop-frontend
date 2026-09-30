import type { CartItem } from "@/types/cart";
import type { CustomerInfo } from "@/types/checkout";
import type { DeliveryMethod, ShippingAddress } from "@/types/delivery";
import type { Order } from "@/types/order";
import type { PaymentMethod } from "@/types/payment";
import type { PickupQr } from "@/types/qr";
import {
  cacheOrder,
  cachePickupQr,
  readCachedOrder,
  readCachedPickupQr,
} from "@/features/order/store/order-cache";

type CreateMockOrderInput = {
  items: CartItem[];
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  shippingAddress: ShippingAddress | null;
  paymentMethod: PaymentMethod | null;
};

export async function createMockOrder(input: CreateMockOrderInput): Promise<Order> {
  const response = await fetch("/api/shop/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Impossible d'enregistrer la commande.");
  }
  const order = (await response.json()) as Order;
  const qr: PickupQr = {
    orderId: order.id,
    status: "ready",
    imageUrl: null,
    alt: `QR de retrait ${order.reference}`,
  };
  cacheOrder(order);
  cachePickupQr(qr);
  return order;
}

export async function getMockOrder(id: string): Promise<Order | undefined> {
  const cached = readCachedOrder(id);
  if (cached) {
    return cached;
  }
  const response = await fetch(`/api/shop/orders/${id}`, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    return undefined;
  }
  const data = (await response.json()) as { order: Order; qr: PickupQr | null };
  cacheOrder(data.order);
  if (data.qr) {
    cachePickupQr(data.qr);
  }
  return data.order;
}

export async function getMockPickupQr(orderId: string): Promise<PickupQr | undefined> {
  const cached = readCachedPickupQr(orderId);
  if (cached) {
    return cached;
  }
  const response = await fetch(`/api/shop/orders/${orderId}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    return undefined;
  }
  const data = (await response.json()) as { order: Order; qr: PickupQr | null };
  if (data.qr) {
    cachePickupQr(data.qr);
  }
  return data.qr ?? undefined;
}
