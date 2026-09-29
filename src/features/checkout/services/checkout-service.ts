import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { useMockApi } from "@/lib/config/env";
import { validateCheckoutDraft } from "@/lib/validation/checkout";
import type { CartItem } from "@/types/cart";
import type { CheckoutDraft } from "@/types/checkout";
import type { Order } from "@/types/order";
import { createMockOrder } from "@/features/order/services/order-mock";

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

  return apiRequest<Order>(apiEndpoints.checkout, {
    method: "POST",
    body: {
      customer: draft.customer,
      deliveryMethod: draft.deliveryMethod,
      shippingAddress: draft.shippingAddress,
      paymentMethod: draft.paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    },
  });
}
