import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import { useMockApi } from "@/lib/config/env";
import type { Order } from "@/types/order";
import { getMockOrder } from "@/features/order/services/order-mock";

export async function getOrderById(id: string): Promise<Order> {
  const order = useMockApi
    ? getMockOrder(id)
    : await apiRequest<Order>(apiEndpoints.orderById(id));

  if (!order) {
    throw new NotFoundError("Cette commande est introuvable.");
  }

  return order;
}
