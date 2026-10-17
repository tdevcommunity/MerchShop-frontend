import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { LaravelOrder } from "@/lib/api/types";
import { mapLaravelOrderToOrder } from "@/lib/api/mappers";
import { cacheOrder, readCachedOrder } from "@/features/order/store/order-cache";
import type { Order } from "@/types/order";

/**
 * Interroge Velto cote serveur au retour navigateur (quand le webhook n'arrive pas).
 */
export async function syncPaymentReturn(
  orderId: string,
  transactionId?: string,
): Promise<Order> {
  const cached = readCachedOrder(orderId);
  const trimmed = transactionId?.trim() ?? "";
  const raw = await apiRequest<LaravelOrder>(
    apiEndpoints.syncPaymentReturn(orderId),
    {
      method: "POST",
      body: trimmed !== "" ? { transaction_id: trimmed } : {},
    },
  );

  const order = mapLaravelOrderToOrder(raw, cached?.customer);
  cacheOrder(order);
  return order;
}
