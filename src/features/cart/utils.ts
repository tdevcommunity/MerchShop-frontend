import type { Cart, CartItem } from "@/types/cart";

export const MAX_LINE_QUANTITY = 10;

export function lineSubtotal(item: Pick<CartItem, "unitPrice" | "quantity">): number {
  return item.unitPrice * item.quantity;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + lineSubtotal(item), 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function toCartSnapshot(items: CartItem[]): Cart {
  return {
    items,
    subtotal: cartSubtotal(items),
    itemCount: cartItemCount(items),
  };
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

export function variantLabel(size: string | null, color: string | null): string {
  return [color, size].filter(Boolean).join(" · ") || "Standard";
}
