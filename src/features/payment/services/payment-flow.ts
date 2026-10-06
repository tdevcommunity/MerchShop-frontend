import { getOrderById } from "@/features/order/services/order-service";
import type { Order } from "@/types/order";

/**
 * Attend qu'une commande sorte de l'etat « en attente de reglement ».
 *
 * Le reglement n'est etabli que par le webhook FedaPay, donc par une notification
 * que le navigateur ne declenche pas : l'ordre retourne est une observation, pas
 * une preuve. Ce qui est observe ici sert uniquement a rediriger vers la bonne
 * page — la page de confirmation, elle, ne doit rien afficher sans paiement.
 *
 * Les intervalles croissent : le webhook arrive en quelques secondes dans le cas
 * courant, et un rythme constant martelerait l'API pendant tout le reste.
 */
const INTERVALS_MS = [1200, 1500, 2000, 2500, 3000, 4000] as const;

export type PaymentOutcome =
  | { state: "paid"; order: Order }
  | { state: "failed"; order: Order }
  | { state: "pending"; order: Order };

function isPaid(order: Order): boolean {
  return (
    order.paymentStatus === "success" ||
    order.status === "paid" ||
    order.status === "ready_for_pickup" ||
    order.status === "picked_up"
  );
}

function isFailed(order: Order): boolean {
  return (
    order.status === "cancelled" ||
    order.status === "refunded" ||
    order.status === "refund_pending" ||
    order.paymentStatus === "failed"
  );
}

export async function awaitPaymentOutcome(
  orderId: string,
  maxWaitMs = 60000,
): Promise<PaymentOutcome> {
  const startTime = Date.now();
  let attempt = 0;
  let lastOrder: Order | null = null;

  while (Date.now() - startTime < maxWaitMs) {
    const order = await getOrderById(orderId);
    lastOrder = order;

    if (isPaid(order)) {
      return { state: "paid", order };
    }
    if (isFailed(order)) {
      return { state: "failed", order };
    }

    const interval =
      INTERVALS_MS[Math.min(attempt, INTERVALS_MS.length - 1)] ?? 4000;
    attempt += 1;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  // Delai depasse : le webhook n'est pas encore passe. On rend la derniere
  // observation plutot qu'une erreur, pour que l'interface affiche « en cours »
  // au lieu d'annoncer un echec qui n'a pas eu lieu.
  const fallback = lastOrder ?? (await getOrderById(orderId));
  return { state: "pending", order: fallback };
}