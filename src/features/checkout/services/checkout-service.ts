import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { useMockApi } from "@/lib/config/env";
import { validateCheckoutDraft } from "@/lib/validation/checkout";
import type { CartItem } from "@/types/cart";
import type { CheckoutDraft } from "@/types/checkout";
import type { Order } from "@/types/order";
import { createMockOrder } from "@/features/order/services/order-mock";
import { cacheOrder } from "@/features/order/store/order-cache";
import { saveOrderGuestToken } from "@/lib/api/order-token";
import type { LaravelOrder, LaravelSingleResponse } from "@/lib/api/types";
import {
  formatShippingAddress,
  mapLaravelOrderToOrder,
} from "@/lib/api/mappers";

export async function createCheckoutSession(
  draft: CheckoutDraft,
  items: CartItem[],
): Promise<Order> {
  validateCheckoutDraft(draft);

  if (!draft.deliveryMethod) {
    throw new Error("Mode de réception manquant.");
  }

  if (useMockApi) {
    return createMockOrder({
      items,
      customer: draft.customer,
      deliveryMethod: draft.deliveryMethod,
      shippingAddress:
        draft.deliveryMethod === "delivery" ? draft.shippingAddress : null,
      paymentMethod: draft.paymentMethod,
    });
  }

  // Format payload for Laravel StoreOrderRequest
  const laravelPayload = {
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
  };

  const response = await apiRequest<LaravelSingleResponse<LaravelOrder>>(
    apiEndpoints.orders,
    {
      method: "POST",
      body: laravelPayload,
    },
  );

  const rawOrder = response.data || (response as unknown as LaravelOrder);

  if (rawOrder.guestAccessToken) {
    saveOrderGuestToken(rawOrder.uuid, rawOrder.guestAccessToken);
  }

  const order = mapLaravelOrderToOrder(rawOrder, draft.customer);
  cacheOrder(order);

  return order;
}
