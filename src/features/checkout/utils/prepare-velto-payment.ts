import type { CheckoutDraft } from "@/types/checkout";
import { checkoutDraftStore } from "@/features/checkout/store/checkout-draft-store";

/**
 * Velto choisit Mobile Money / carte sur son portail : on fixe un moyen
 * par defaut cote API sans afficher l'etape paiement du tunnel.
 */
export function applyDefaultVeltoPayment(draft: CheckoutDraft): CheckoutDraft {
  return {
    ...draft,
    paymentMethod: "mobile_money",
    mobileOperator: draft.mobileOperator ?? "mixx",
  };
}

/** Persiste tout le brouillon avant d'ouvrir Velto (evite un store desynchronise). */
export function commitCheckoutDraftForPayment(draft: CheckoutDraft): CheckoutDraft {
  const ready = applyDefaultVeltoPayment(draft);
  checkoutDraftStore.update({
    customer: ready.customer,
    deliveryMethod: ready.deliveryMethod,
    shippingAddress: ready.shippingAddress,
    paymentMethod: ready.paymentMethod,
    mobileOperator: ready.mobileOperator,
  });
  return ready;
}

export function prepareCheckoutForVeltoPayment(): CheckoutDraft {
  return commitCheckoutDraftForPayment(checkoutDraftStore.getSnapshot());
}

export function readyDraftForVeltoCheckout(): CheckoutDraft {
  return applyDefaultVeltoPayment(checkoutDraftStore.getSnapshot());
}
