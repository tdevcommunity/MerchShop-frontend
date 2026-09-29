import { beforeEach, describe, expect, it } from "vitest";
import { cartStore } from "./cart-store";

describe("cart-store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    cartStore.clear();
  });

  it("ajoute une ligne puis fusionne la même variante", () => {
    cartStore.addItem({
      productId: "p1",
      variantId: "v1",
      productName: "T-shirt",
      variantLabel: "M",
      size: "M",
      color: "Noir",
      unitPrice: 8000,
      imageUrl: null,
    });
    cartStore.addItem({
      productId: "p1",
      variantId: "v1",
      productName: "T-shirt",
      variantLabel: "M",
      size: "M",
      color: "Noir",
      unitPrice: 8000,
      imageUrl: null,
      quantity: 2,
    });

    const cart = cartStore.getSnapshot();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.quantity).toBe(3);
    expect(cart.subtotal).toBe(24000);
  });

  it("retire une ligne", () => {
    cartStore.addItem({
      productId: "p1",
      variantId: "v1",
      productName: "T-shirt",
      variantLabel: "M",
      size: "M",
      color: "Noir",
      unitPrice: 8000,
      imageUrl: null,
    });
    cartStore.removeItem("p1", "v1");
    expect(cartStore.getSnapshot().items).toHaveLength(0);
  });

  it("persiste dans localStorage", () => {
    cartStore.addItem({
      productId: "p1",
      variantId: "v1",
      productName: "T-shirt",
      variantLabel: "M",
      size: "M",
      color: "Noir",
      unitPrice: 8000,
      imageUrl: null,
    });
    expect(window.localStorage.getItem("tdev-merch-cart")).toContain("p1");
  });
});
