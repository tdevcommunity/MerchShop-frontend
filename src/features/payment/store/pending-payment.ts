import type { CartItem } from "@/types/cart";

const PENDING_KEY = "tdev-merch-pending-payment";
const CART_BACKUP_KEY = "tdev-merch-cart-backup";

export type PendingPayment = {
  orderId: string;
  checkoutUrl: string;
  startedAt: number;
};

/**
 * Commande en cours de reglement chez FedaPay.
 *
 * Le retour de l'operateur est configure cote backend et ne peut donc pas
 * porter l'identifiant de la commande : l'adresse de retour est une seule et
 * meme page pour tous les acheteurs. C'est ceStore qui fait le lien, en
 * memorisant la commande juste avant la redirection.
 *
 * `sessionStorage` et non `localStorage` : la donnee vaut le temps d'un
 * paiement, et une commande en attente ne doit pas resusciter des jours plus
 * tard dans un autre onglet.
 */
export function rememberPendingPayment(
  orderId: string,
  checkoutUrl: string,
): void {
  if (typeof window === "undefined" || !orderId || !checkoutUrl) {
    return;
  }
  const pending: PendingPayment = { orderId, checkoutUrl, startedAt: Date.now() };
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // stockage indisponible : le retour affichera un etat indeterminate
  }
}

export function readPendingPayment(): PendingPayment | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PendingPayment;
    return parsed?.orderId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingPayment(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // stockage indisponible
  }
}

/**
 * La commande en attente est-elle encore plausible ?
 *
 * FedaPay peut mettre plusieurs minutes a valider un paiement. Au-dela d'une
 * heure, ce que l'on rapporterait ne decrirait plus la tentative en cours et
 * afficherait un etat trompeur : on rend alors la main a l'acheteur.
 */
export function isPendingPaymentStale(
  pending: PendingPayment,
  maxAgeMs = 60 * 60 * 1000,
): boolean {
  return Date.now() - pending.startedAt > maxAgeMs;
}

/**
 * Sauvegarde le panier avant de le vider pour le restaurer en cas d'échec.
 */
export function backupCart(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(CART_BACKUP_KEY, JSON.stringify(items));
  } catch {
    // stockage indisponible
  }
}

/**
 * Restaure le panier sauvegardé et nettoie la sauvegarde.
 */
export function restoreCart(): CartItem[] | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(CART_BACKUP_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CartItem[];
    window.sessionStorage.removeItem(CART_BACKUP_KEY);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Nettoie la sauvegarde du panier (après paiement réussi).
 */
export function clearCartBackup(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(CART_BACKUP_KEY);
  } catch {
    // stockage indisponible
  }
}