import type { DeliveryMethod, ShippingAddress } from "./delivery";

export const CHECKOUT_STEPS = [
  "customer",
  "delivery",
  "review",
  "payment",
] as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type CheckoutDraft = {
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod | null;
  shippingAddress: ShippingAddress | null;
};

export type CheckoutPayload = {
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  shippingAddress: ShippingAddress | null;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
};
