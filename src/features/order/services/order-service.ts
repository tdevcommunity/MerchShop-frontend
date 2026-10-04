import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import { useMockApi } from "@/lib/config/env";
import type { Order } from "@/types/order";
import { getMockOrder } from "@/features/order/services/order-mock";
import { cacheOrder, readCachedOrder } from "@/features/order/store/order-cache";
import type { LaravelOrder, LaravelSingleResponse } from "@/lib/api/types";
import { mapLaravelOrderToOrder } from "@/lib/api/mappers";

export async function getOrderById(id: string): Promise<Order> {
  if (useMockApi) {
    const order = await getMockOrder(id);
    if (!order) {
      throw new NotFoundError("Cette commande est introuvable.");
    }
    return order;
  }

  const cached = readCachedOrder(id);

  const response = await apiRequest<
    LaravelSingleResponse<LaravelOrder> | LaravelOrder
  >(apiEndpoints.orderById(id));

  const rawOrder =
    "data" in response && response.data ? response.data : (response as LaravelOrder);

  if (!rawOrder || !rawOrder.uuid) {
    throw new NotFoundError("Cette commande est introuvable.");
  }

  const order = mapLaravelOrderToOrder(rawOrder, cached?.customer);
  cacheOrder(order);

  return order;
}
