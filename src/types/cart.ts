import type { MoneyAmount } from "./money";
import type { TextileSize } from "./catalog";

/**
 * Ligne de panier côté client (état UX).
 * Prix, stock et totaux seront recalculés / validés par le backend au checkout.
 */
export type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  size: TextileSize | null;
  color: string | null;
  quantity: number;
  unitPrice: MoneyAmount;
  imageUrl: string | null;
};

export type Cart = {
  items: CartItem[];
  /** Sous-total UX uniquement — non opposable au paiement. */
  subtotal: MoneyAmount;
  itemCount: number;
};

export function cartLineKey(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}
