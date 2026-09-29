import { PAYMENT_STATUSES, type PaymentStatus } from "@/types/payment";

export function isPaymentSuccess(status: PaymentStatus): boolean {
  return status === "success";
}

export function isPaymentPending(status: PaymentStatus): boolean {
  return status === "pending" || status === "processing";
}

export function isKnownPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}
