import type { Order } from "@/types/order";
import type { PickupQr } from "@/types/qr";

const ORDER_PREFIX = "tdev-merch-order:";
const QR_PREFIX = "tdev-merch-qr:";

function readJson<T>(key: string): T | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function cacheOrder(order: Order): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(`${ORDER_PREFIX}${order.id}`, JSON.stringify(order));
}

export function readCachedOrder(id: string): Order | undefined {
  return readJson<Order>(`${ORDER_PREFIX}${id}`);
}

export function cachePickupQr(qr: PickupQr): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(`${QR_PREFIX}${qr.orderId}`, JSON.stringify(qr));
}

export function readCachedPickupQr(orderId: string): PickupQr | undefined {
  return readJson<PickupQr>(`${QR_PREFIX}${orderId}`);
}
