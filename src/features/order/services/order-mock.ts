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

export function createMockOrder(input: CreateMockOrderInput): Order {
  const id = `ord_mock_${Date.now()}`;
  const order: Order = {
    id,
    reference: `TDEV-${id.slice(-6).toUpperCase()}`,
    status: "paid",
    items: input.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantLabel: item.variantLabel,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    total: input.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    ),
    paymentStatus: "success",
    paymentMethod: input.paymentMethod,
    customer: input.customer,
    deliveryMethod: input.deliveryMethod,
    shippingAddress: input.shippingAddress,
    pickupLabel:
      input.deliveryMethod === "pickup_event"
        ? "Stand Merch — Village TDEV"
        : null,
    createdAt: new Date().toISOString(),
  };

  const qr: PickupQr = {
    orderId: id,
    status: "ready",
    imageUrl: null,
    alt: `QR de retrait ${order.reference}`,
  };

  cacheOrder(order);
  cachePickupQr(qr);

  return order;
}

export function getMockOrder(id: string): Order | undefined {
  return readCachedOrder(id);
}

export function getMockPickupQr(orderId: string): PickupQr | undefined {
  return readCachedPickupQr(orderId);
}
