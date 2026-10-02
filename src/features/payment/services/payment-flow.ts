import { getOrderById } from "@/features/order/services/order-service";
import { isPaymentSuccess } from "@/features/payment/services/payment-status";
import type { Order } from "@/types/order";

export async function pollPaymentStatus(
  orderId: string,
  maxWaitMs = 10000,
  intervalMs = 1500,
): Promise<Order> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const order = await getOrderById(orderId);
    if (
      isPaymentSuccess(order.paymentStatus) ||
      order.status === "paid" ||
      order.status === "ready_for_pickup"
    ) {
      return order;
    }
    if (
      order.status === "cancelled" ||
      order.status === "refunded" ||
      order.paymentStatus === "failed"
    ) {
      throw new Error("Le paiement n'a pas abouti. La commande a été annulée.");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // Return last retrieved order state
  return getOrderById(orderId);
}
