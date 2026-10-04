import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { validateCheckoutDraft } from "@/lib/validation/checkout";
import type { CartItem } from "@/types/cart";
import type { CheckoutDraft } from "@/types/checkout";
import type { Order } from "@/types/order";
import { cacheOrder } from "@/features/order/store/order-cache";
import { saveOrderGuestToken } from "@/lib/api/order-token";
import type { LaravelOrder, LaravelSingleResponse } from "@/lib/api/types";
import {
  formatShippingAddress,
  mapLaravelOrderToOrder,
} from "@/lib/api/mappers";
import { createMockOrder } from "@/features/order/services/order-mock";

const useTestMock = process.env.VITEST === "true";

export async function createCheckoutSession(
  draft: CheckoutDraft,
  items: CartItem[],
): Promise<Order> {
  validateCheckoutDraft(draft);

  if (!draft.deliveryMethod) {
    throw new Error("Mode de réception manquant.");
  }

  if (useTestMock) {
    return createMockOrder({
      items,
      customer: draft.customer,
      deliveryMethod: draft.deliveryMethod,
      shippingAddress:
        draft.deliveryMethod === "delivery" ? draft.shippingAddress : null,
      paymentMethod: draft.paymentMethod,
    });
  }

  const response = await apiRequest<LaravelSingleResponse<LaravelOrder>>(
    apiEndpoints.checkout,
    {
      method: "POST",
      body: {
        items: items.map((item) => ({
          uuid: item.variantId,
          quantity: item.quantity,
        })),
        fulfillment_method:
          draft.deliveryMethod === "pickup_event" ? "pickup" : "delivery",
        shipping_address:
          draft.deliveryMethod === "delivery"
            ? formatShippingAddress(draft.shippingAddress)
            : null,
        payment_method: draft.paymentMethod || "mobile_money",
        participant_id: null,
      },
    },
  );

  const rawOrder = response.data;
  if (!rawOrder?.uuid) {
    throw new Error("La réponse de commande est invalide.");
  }

  if (rawOrder.guestAccessToken) {
    saveOrderGuestToken(rawOrder.uuid, rawOrder.guestAccessToken);
  }

  const order = mapLaravelOrderToOrder(rawOrder, draft.customer);
  cacheOrder(order);
  return order;
}
