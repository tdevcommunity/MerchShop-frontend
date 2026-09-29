"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cartStore } from "@/features/cart/store/cart-store";
import type { Cart, CartItem } from "@/types/cart";

export function useCart(): Cart {
  useEffect(() => {
    cartStore.hydrate();
  }, []);

  return useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
}

export function useCartActions() {
  return {
    addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) =>
      cartStore.addItem(item),
    updateQuantity: cartStore.updateQuantity,
    removeItem: cartStore.removeItem,
    clear: cartStore.clear,
  };
}
