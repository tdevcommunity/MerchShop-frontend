import { cartLineKey, type Cart, type CartItem } from "@/types/cart";
import { clampQuantity, toCartSnapshot } from "@/features/cart/utils";

const STORAGE_KEY = "tdev-merch-cart";

type Listener = () => void;

const emptyCart: Cart = { items: [], subtotal: 0, itemCount: 0 };

function readItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Partial<CartItem>;
  return (
    typeof item.productId === "string" &&
    typeof item.variantId === "string" &&
    typeof item.productName === "string" &&
    typeof item.quantity === "number"
  );
}

function writeItems(items: CartItem[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let snapshot: Cart = emptyCart;
const listeners = new Set<Listener>();

function emit(items: CartItem[]): void {
  snapshot = toCartSnapshot(items);
  listeners.forEach((listener) => listener());
}

function currentItems(): CartItem[] {
  return typeof window === "undefined" ? snapshot.items : readItems();
}

export const cartStore = {
  hydrate(): void {
    emit(readItems());
  },
  subscribe(listener: Listener): () => void {
    if (typeof window !== "undefined") {
      snapshot = toCartSnapshot(readItems());
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): Cart {
    return snapshot;
  },
  getServerSnapshot(): Cart {
    return emptyCart;
  },
  addItem(input: Omit<CartItem, "quantity"> & { quantity?: number }): void {
    const quantity = clampQuantity(input.quantity ?? 1);
    const items = [...currentItems()];
    const key = cartLineKey(input.productId, input.variantId);
    const index = items.findIndex(
      (item) => cartLineKey(item.productId, item.variantId) === key,
    );
    const existing = index >= 0 ? items[index] : undefined;

    if (existing && index >= 0) {
      items[index] = {
        ...existing,
        quantity: clampQuantity(existing.quantity + quantity),
      };
    } else {
      items.push({ ...input, quantity });
    }

    writeItems(items);
    emit(items);
  },
  updateQuantity(productId: string, variantId: string, quantity: number): void {
    const items = currentItems()
      .map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: clampQuantity(quantity) }
          : item,
      )
      .filter((item) => item.quantity > 0);
    writeItems(items);
    emit(items);
  },
  removeItem(productId: string, variantId: string): void {
    const items = currentItems().filter(
      (item) =>
        !(item.productId === productId && item.variantId === variantId),
    );
    writeItems(items);
    emit(items);
  },
  clear(): void {
    writeItems([]);
    emit([]);
  },
};
