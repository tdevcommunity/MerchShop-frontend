export const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "success",
  "failed",
  "cancelled",
  "unknown",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  "mobile_money",
  "card",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Payment = {
  id: string;
  orderId: string;
  status: PaymentStatus;
  method: PaymentMethod | null;
  /** Montant confirmé par le backend, jamais par le client. */
  amount: number;
  providerRef: string | null;
};
