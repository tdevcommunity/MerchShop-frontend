import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { LaravelPayment } from "@/lib/api/types";
import { mapLaravelPaymentToPayment } from "@/lib/api/mappers";
import { AppError } from "@/lib/api/errors";
import type { Payment } from "@/types/payment";

export type PaymentCheckout = {
  payment: Payment;
  /** Adresse Velto a ouvrir dans le navigateur. */
  checkoutUrl: string;
};

/**
 * Ouvre le reglement d'une commande chez Velto et renvoie l'adresse a suivre.
 */
export async function openPaymentCheckout(
  orderId: string,
): Promise<PaymentCheckout> {
  const raw = await apiRequest<LaravelPayment>(apiEndpoints.payOrder(orderId), {
    method: "POST",
  });

  const checkoutUrl = raw?.checkoutUrl;
  if (typeof checkoutUrl !== "string" || checkoutUrl === "") {
    throw new AppError(
      "payment_checkout",
      "Le paiement est indisponible pour le moment. Réessaie dans un instant.",
    );
  }

  return { payment: mapLaravelPaymentToPayment(raw), checkoutUrl };
}
