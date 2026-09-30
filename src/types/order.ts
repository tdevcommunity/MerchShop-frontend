import type { MoneyAmount } from "./money";
import type { DeliveryMethod, ShippingAddress } from "./delivery";
import type { PaymentMethod, PaymentStatus } from "./payment";
import type { TextileSize } from "./catalog";
import type { CustomerInfo } from "./checkout";

export const ORDER_STATUSES = [
  "draft",
  "awaiting_payment",
  "paid",
  "processing",
  "ready_for_pickup",
  "shipped",
  "picked_up",
  "completed",
  "cancelled",
  "expired",
  "payment_failed",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  size: TextileSize | null;
  color: string | null;
  quantity: number;
  unitPrice: MoneyAmount;
};

export type Order = {
  uuid: string;
  orderNumber: string;
  status: number;
  fulfillmentMethod: "pickup" | "delivery";
  pickupStatus: "pending" | "picked_up" | "cancelled" | null;
  pickupTime: string | null;
  participantId: string | null;
  subTotal: number;
  discount: number;
  deliveryFee: number;
  currency: string;
  total: number;
  shippingAddress: string | null;
  items: Array<{
    uuid: string;
    productUuid: string;
    variantUuid: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  paymentStatus: number | null;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
};
};
