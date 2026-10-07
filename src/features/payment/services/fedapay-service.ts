import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { LaravelPayment } from "@/lib/api/types";
import { mapLaravelPaymentToPayment } from "@/lib/api/mappers";
import type { Payment } from "@/types/payment";

/**
 * Reglement ouvert chez l'operateur.
 *
 * `checkoutUrl` est volontairement hors du modele `Payment` : c'est une adresse
 * de passage a ouvrir une fois, pas un etat de la tentative. La garder dans le
 * domaine ferait croire qu'elle reste valide et pourrait etre reapresentee a
 * chaque relecture de la commande.
 */
export type FedapayCheckout = {
  payment: Payment;
  /** Adresse FedaPay a ouvrir dans le navigateur. */
  checkoutUrl: string;
};

/**
 * Ouvre le reglement d'une commande chez FedaPay et renvoie l'adresse a suivre.
 *
 * L'API decide de l'agregateur : elle renvoie la page a ouvrir et le client ne
 * fait que s'y rendre. Aucun appel a FedaPay depuis le navigateur, aucune cle
 * d'API cote front.
 *
 * La route est idempotente cote backend : la rappeler rend la meme adresse sans
 * ouvrir une seconde transaction, ce qui permet de recharger cette page sans
 * multiplier les paiements d'une meme commande.
 *
 * Aucune redirection ici : la navigation reste le fait de l'appelant.
 */
export async function openFedapayCheckout(
  orderId: string,
): Promise<FedapayCheckout> {
  const raw = await apiRequest<LaravelPayment>(apiEndpoints.payOrder(orderId), {
    method: "POST",
  });

  const checkoutUrl = raw?.checkoutUrl;
  if (typeof checkoutUrl !== "string" || checkoutUrl === "") {
    throw new Error(
      "Le prestataire de paiement n'a pas renvoyé d'adresse de règlement.",
    );
  }

  return { payment: mapLaravelPaymentToPayment(raw), checkoutUrl };
}