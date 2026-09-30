import type { MoneyAmount } from "./money";
import type { TextileSize } from "./catalog";

/**
 * Ligne de panier côté client (état UX).
 * Prix, stock et totaux seront recalculés / validés par le backend au checkout.
 */
export type CartItem = {
  variantUuid: string;
  productName: string;
  variantName: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
};

export type Cart = {
  items: CartItem[];
  /** Sous-total UX uniquement — non opposable au paiement. */
  subtotal: MoneyAmount;
  itemCount: number;
};

export function cartLineKey(productUuid: string, variantUuid: string): string {
  return `${productUuid}:${variantUuid}`;
}
