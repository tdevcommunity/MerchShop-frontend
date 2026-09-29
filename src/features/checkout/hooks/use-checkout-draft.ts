"use client";

import { useEffect, useSyncExternalStore } from "react";
import { checkoutDraftStore } from "@/features/checkout/store/checkout-draft-store";
import type { CheckoutDraft } from "@/types/checkout";

export function useCheckoutDraft(): CheckoutDraft {
  useEffect(() => {
    checkoutDraftStore.hydrate();
  }, []);

  return useSyncExternalStore(
    checkoutDraftStore.subscribe,
    checkoutDraftStore.getSnapshot,
    checkoutDraftStore.getServerSnapshot,
  );
}

export function useCheckoutDraftActions() {
  return {
    update: checkoutDraftStore.update,
    clear: checkoutDraftStore.clear,
  };
}
