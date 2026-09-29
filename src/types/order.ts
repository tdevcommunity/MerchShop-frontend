import type { MoneyAmount } from "./money";
import type { DeliveryMethod, ShippingAddress } from "./delivery";
import type { PaymentStatus } from "./payment";
import type { TextileSize } from "./catalog";

export const ORDER_STATUSES = [
  "draft",
  "awaiting_payment",
  "paid",
  "ready_for_pickup",
  "shipped",
  "completed",
  "cancelled",
  "expired",
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
  id: string;
  reference: string;
  status: OrderStatus;
  items: OrderItem[];
  total: MoneyAmount;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  shippingAddress: ShippingAddress | null;
  pickupLabel: string | null;
  createdAt: string;
};
