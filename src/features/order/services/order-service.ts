import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import type { Order } from "@/types/order";
import { cacheOrder, readCachedOrder } from "@/features/order/store/order-cache";
import type { LaravelOrder } from "@/lib/api/types";
import { mapLaravelOrderToOrder } from "@/lib/api/mappers";

/**
 * Lit une commande chez l'API.
 *
 * `apiRequest` deballe deja l'enveloppe `data` : la reponse est donc la
 * commande elle-meme. Lire `response.data` ici renverrait `undefined` et
 * ferait passer une commande parfaitement valide pour introuvable.
 */
export async function getOrderById(id: string): Promise<Order> {
  const cached = readCachedOrder(id);

  const rawOrder = await apiRequest<LaravelOrder>(apiEndpoints.orderById(id));

  if (!rawOrder?.uuid) {
    throw new NotFoundError("Cette commande est introuvable.");
  }

  const order = mapLaravelOrderToOrder(rawOrder, cached?.customer);
  cacheOrder(order);

  return order;
}