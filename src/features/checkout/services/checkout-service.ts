import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { validateCheckoutDraft } from "@/lib/validation/checkout";
import type { CartItem } from "@/types/cart";
import type { CheckoutDraft } from "@/types/checkout";
import type { Order } from "@/types/order";
import { cacheOrder } from "@/features/order/store/order-cache";
import { saveOrderGuestToken } from "@/lib/api/order-token";
import type { LaravelOrder } from "@/lib/api/types";
import { formatShippingAddress, mapLaravelOrderToOrder } from "@/lib/api/mappers";
import { toUserMessage } from "@/lib/api/errors";

export async function createCheckoutSession(
  draft: CheckoutDraft,
  items: CartItem[],
): Promise<Order> {
  validateCheckoutDraft(draft);

  if (!draft.deliveryMethod) {
    throw new Error("Mode de réception manquant.");
  }

  /*
   * L'API refuse un panier vide (`items` : min 1), donc on ne lui envoie pas
   * une commande dont on sait deja qu'elle sera refusee. Le controle est ici,
   * cote client, parce que le panier est une donnee de l'interface : c'est le
   * seul endroit ou l'on peut dire a l'acheteur « ton panier est vide » plutot
   * que de lui renvoyer un refus de formulaire.
   */
  if (items.length === 0) {
    throw new Error("Ton panier est vide.");
  }

  /*
   * L'API n'identifie l'acheteur que par son nom et son numero de telephone :
   * ce sont les deux seules donnees dont elle a besoin pour encaisser et
   * livrer, et elle les refuse si elles manquent. Le prenom et le nom de
   * famille saisis au checkout sont donc concatenes en un seul nom complet —
   * c'est ce champ, `customer_name`, que la regle attend.
   *
   * Le numero est envoye tel quel, prefixe pays compris quand l'acheteur en a
   * saisi un : c'est l'API qui le normalise et qui refuse un format invalide,
   * donc pre-valider ici reviendrait a inventer une regle de plus que la sienne.
   */
  const customerName = [draft.customer.firstName, draft.customer.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  const rawOrder = await apiRequest<LaravelOrder>(apiEndpoints.checkout, {
    method: "POST",
    body: {
      items: items.map((item) => ({
        uuid: item.variantId,
        quantity: item.quantity,
      })),
      customer_name: customerName,
      customer_phone_number: draft.customer.phone.trim(),
      fulfillment_method:
        draft.deliveryMethod === "pickup_event" ? "pickup" : "delivery",
      shipping_address:
        draft.deliveryMethod === "delivery"
          ? formatShippingAddress(draft.shippingAddress)
          : null,
      payment_method: draft.paymentMethod || "mobile_money",
      participant_id: null,
    },
  });

  if (!rawOrder?.uuid) {
    throw new Error(toUserMessage(new Error("La réponse de commande est invalide.")));
  }

  /*
   * Le jeton d'invite n'est renvoye qu'a la creation. Il est la seule voie
   * d'acces a cette commande pour un acheteur sans compte, donc il doit etre
   * conserve avant tout appel ulterieur — sans lui, le QR de retrait et le
   * suivi de paiement renverraient 403.
   */
  if (rawOrder.guestAccessToken) {
    saveOrderGuestToken(rawOrder.uuid, rawOrder.guestAccessToken);
  }

  const order = mapLaravelOrderToOrder(rawOrder, draft.customer);
  cacheOrder(order);
  return order;
}