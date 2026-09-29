import type { DeliveryMethod, ShippingAddress } from "./delivery";
import type { PaymentMethod } from "./payment";

export const CHECKOUT_STEPS = [
  "fulfillment",
  "information",
  "payment",
  "confirmation",
] as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export const MOBILE_OPERATORS = ["mixx", "moov"] as const;

export type MobileOperator = (typeof MOBILE_OPERATORS)[number];

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
  paymentMethod: PaymentMethod | null;
  mobileOperator: MobileOperator | null;
};

export type CheckoutPayload = {
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  shippingAddress: ShippingAddress | null;
  paymentMethod: PaymentMethod;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }>;
};
