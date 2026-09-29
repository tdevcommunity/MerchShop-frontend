import { describe, expect, it } from "vitest";
import {
  cartItemCount,
  cartSubtotal,
  clampQuantity,
  lineSubtotal,
  MAX_LINE_QUANTITY,
  toCartSnapshot,
  variantLabel,
} from "./utils";
import type { CartItem } from "@/types/cart";

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: "p1",
  variantId: "v1",
  productName: "T-shirt",
  variantLabel: "Noir · M",
  size: "M",
  color: "Noir",
  quantity: 2,
  unitPrice: 8000,
  imageUrl: null,
  ...overrides,
});

describe("cart utils", () => {
  it("calcule le sous-total d'une ligne", () => {
    expect(lineSubtotal(item({ unitPrice: 8000, quantity: 3 }))).toBe(24000);
  });

  it("calcule le sous-total du panier", () => {
    expect(
      cartSubtotal([
        item({ quantity: 2, unitPrice: 8000 }),
        item({ productId: "p2", variantId: "v2", quantity: 1, unitPrice: 5000 }),
      ]),
    ).toBe(21000);
  });

  it("compte les articles", () => {
    expect(cartItemCount([item({ quantity: 2 }), item({ quantity: 3 })])).toBe(5);
  });

  it("borne la quantité", () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(MAX_LINE_QUANTITY + 4)).toBe(MAX_LINE_QUANTITY);
    expect(clampQuantity(2.9)).toBe(2);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });

  it("produit un snapshot cohérent", () => {
    const snapshot = toCartSnapshot([item({ quantity: 2, unitPrice: 1000 })]);
    expect(snapshot.itemCount).toBe(2);
    expect(snapshot.subtotal).toBe(2000);
  });

  it("formate le libellé de variante", () => {
    expect(variantLabel("M", "Noir")).toBe("Noir · M");
    expect(variantLabel(null, null)).toBe("Standard");
  });
});
