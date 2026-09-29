import type { CheckoutDraft } from "@/types/checkout";

const STORAGE_KEY = "tdev-merch-checkout-draft";

type Listener = () => void;

export const emptyCheckoutDraft: CheckoutDraft = {
  customer: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  deliveryMethod: null,
  shippingAddress: {
    line1: "",
    city: "",
    country: "Togo",
  },
  paymentMethod: null,
  mobileOperator: null,
};

function isDraft(value: unknown): value is CheckoutDraft {
  if (!value || typeof value !== "object") {
    return false;
  }
  const draft = value as Partial<CheckoutDraft>;
  return Boolean(draft.customer && typeof draft.customer === "object");
}

function readDraft(): CheckoutDraft {
  if (typeof window === "undefined") {
    return emptyCheckoutDraft;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyCheckoutDraft;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isDraft(parsed)) {
      return emptyCheckoutDraft;
    }
    return {
      ...emptyCheckoutDraft,
      ...parsed,
      customer: { ...emptyCheckoutDraft.customer, ...parsed.customer },
      shippingAddress: parsed.shippingAddress
        ? { ...emptyCheckoutDraft.shippingAddress, ...parsed.shippingAddress }
        : emptyCheckoutDraft.shippingAddress,
    };
  } catch {
    return emptyCheckoutDraft;
  }
}

let snapshot: CheckoutDraft = emptyCheckoutDraft;
const listeners = new Set<Listener>();

function emit(draft: CheckoutDraft): void {
  snapshot = draft;
  listeners.forEach((listener) => listener());
}

export const checkoutDraftStore = {
  hydrate(): void {
    emit(readDraft());
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): CheckoutDraft {
    return snapshot;
  },
  getServerSnapshot(): CheckoutDraft {
    return emptyCheckoutDraft;
  },
  update(partial: Partial<CheckoutDraft>): void {
    const next = { ...readDraft(), ...partial };
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    emit(next);
  },
  clear(): void {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    emit(emptyCheckoutDraft);
  },
};
