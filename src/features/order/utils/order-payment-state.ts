import type { Order } from "@/types/order";

/**
 * Une commande est payee uniquement lorsque l'API a confirme le reglement.
 * Le statut de fulfillment seul ne suffit pas (webhook en retard, donnees incoherentes).
 */
export function isOrderPaid(order: Order): boolean {
  if (order.paymentStatus === "success") {
    return true;
  }

  if (
    (order.status === "ready_for_pickup" || order.status === "picked_up") &&
    order.paymentStatus !== "pending" &&
    order.paymentStatus !== "unknown" &&
    order.paymentStatus !== "failed"
  ) {
    return true;
  }

  return false;
}

export function isOrderPaymentFailed(order: Order): boolean {
  return (
    order.status === "cancelled" ||
    order.status === "refunded" ||
    order.status === "refund_pending" ||
    order.paymentStatus === "failed" ||
    order.status === "payment_failed"
  );
}

export function isOrderAwaitingPayment(order: Order): boolean {
  if (isOrderPaid(order) || isOrderPaymentFailed(order)) {
    return false;
  }
  return (
    order.status === "awaiting_payment" ||
    order.status === "paid" ||
    order.paymentStatus === "pending" ||
    order.paymentStatus === "unknown"
  );
}
