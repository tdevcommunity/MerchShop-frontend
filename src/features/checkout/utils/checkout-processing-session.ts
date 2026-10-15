import type { CartItem } from "@/types/cart";
import type { CheckoutDraft } from "@/types/checkout";
import type { Order } from "@/types/order";
import { createCheckoutSession } from "@/features/checkout/services/checkout-service";
import { cartStore } from "@/features/cart/store/cart-store";
import { checkoutDraftStore } from "@/features/checkout/store/checkout-draft-store";
import { openPaymentCheckout } from "@/features/payment/services/payment-checkout-service";
import { rememberPendingPayment } from "@/features/payment/store/pending-payment";
import { commitCheckoutDraftForPayment } from "@/features/checkout/utils/prepare-velto-payment";
import { validateCheckoutDraft } from "@/lib/validation/checkout";
import type { PaymentCheckout } from "@/features/payment/services/payment-checkout-service";
import {
  resetVeltoRedirectSession,
  stageVeltoRedirect,
} from "@/features/checkout/utils/velto-redirect-session";

export {
  completeVeltoRedirectIfReady,
  markVeltoRedirectStarted,
  resumeVeltoRedirectIfNeeded,
  stageVeltoRedirect,
  subscribeVeltoRedirectReady,
} from "@/features/checkout/utils/velto-redirect-session";

/** Evite deux commandes si React rejoue l'effet (StrictMode). */
let sharedOrderPromise: Promise<Order> | null = null;

const sharedOpenPaymentByOrder = new Map<string, Promise<PaymentCheckout>>();

function prefetchOpenPayment(orderId: string): void {
  void getSharedOpenPaymentCheckout(orderId, () => openPaymentCheckout(orderId))
    .then(({ checkoutUrl }) => {
      stageVeltoRedirect(orderId, checkoutUrl);
      rememberPendingPayment(orderId, checkoutUrl);
    })
    .catch(() => {
      // La page processing affichera l'erreur.
    });
}

/**
 * Lance la creation de commande (puis l'ouverture Velto) avant la navigation
 * vers /checkout/processing pour reduire le temps d'attente a l'ecran.
 */
export function beginVeltoCheckoutPipeline(
  draft: CheckoutDraft,
  items: CartItem[],
): void {
  if (items.length === 0 || sharedOrderPromise) {
    return;
  }

  checkoutDraftStore.hydrate();
  cartStore.hydrate();

  const readyDraft = commitCheckoutDraftForPayment(draft);
  try {
    validateCheckoutDraft(readyDraft);
  } catch {
    return;
  }

  void getSharedCheckoutOrder(() =>
    createCheckoutSession(readyDraft, items),
  )
    .then((order) => {
      prefetchOpenPayment(order.id);
    })
    .catch(() => {
      // La page processing affichera l'erreur.
    });
}

export function getSharedCheckoutOrder(
  create: () => Promise<Order>,
): Promise<Order> {
  if (!sharedOrderPromise) {
    sharedOrderPromise = create().catch((error) => {
      sharedOrderPromise = null;
      throw error;
    });
  }
  return sharedOrderPromise;
}

export function getSharedOpenPaymentCheckout(
  orderId: string,
  open: () => Promise<PaymentCheckout>,
): Promise<PaymentCheckout> {
  let pending = sharedOpenPaymentByOrder.get(orderId);
  if (!pending) {
    pending = open().catch((error) => {
      sharedOpenPaymentByOrder.delete(orderId);
      throw error;
    });
    sharedOpenPaymentByOrder.set(orderId, pending);
  }
  return pending;
}

export function resetSharedCheckoutOrder(): void {
  sharedOrderPromise = null;
  sharedOpenPaymentByOrder.clear();
  resetVeltoRedirectSession();
}
