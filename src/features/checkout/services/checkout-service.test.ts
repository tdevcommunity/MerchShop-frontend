import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { createCheckoutSession } from "./checkout-service";
import type { CartItem } from "@/types/cart";
import type { CheckoutDraft } from "@/types/checkout";

describe("checkout-service", () => {
  beforeAll(() => {
    vi.stubGlobal("fetch", async (url: string, options?: RequestInit) => {
      if (url.includes("/api/shop/orders")) {
        if (options?.body) {
          try {
            const body = JSON.parse(options.body as string);
            if (!body.items || body.items.length === 0) {
              return { ok: false };
            }
          } catch {
            // ignore
          }
        }
        return {
          ok: true,
          json: async () => ({
            id: "ord_123",
            reference: "CMD-123",
            customer: { firstName: "Komi", lastName: "Agbeko", email: "komi@tdev.bj", phone: "+228 90 12 34 56" },
            items: [{ productId: "prod-tee", variantId: "var-tee-m", quantity: 1, unitPrice: 8000 }],
            total: 8000,
            deliveryMethod: "pickup_event",
            paymentMethod: "mobile_money",
            paymentStatus: "pending",
            status: "pending"
          })
        };
      }
      return { ok: false };
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  const sampleDraft: CheckoutDraft = {
    customer: {
      firstName: "Komi",
      lastName: "Agbeko",
      email: "komi@tdev.bj",
      phone: "+228 90 12 34 56",
    },
    deliveryMethod: "pickup_event",
    shippingAddress: null,
    paymentMethod: "mobile_money",
    mobileOperator: "mixx",
  };

  const sampleItems: CartItem[] = [
    {
      productId: "prod-tee",
      variantId: "var-tee-m",
      productName: "T-Shirt TDEV 2026",
      variantLabel: "M / Noir",
      size: "M",
      color: "Noir",
      quantity: 1,
      unitPrice: 8000,
      imageUrl: null,
    },
  ];

  it("crée une session de checkout avec succès en mode mock", async () => {
    const order = await createCheckoutSession(sampleDraft, sampleItems);
    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.customer.firstName).toBe("Komi");
    expect(order.items).toHaveLength(1);
    expect(order.total).toBe(8000);
    expect(order.deliveryMethod).toBe("pickup_event");
  });

  it("rejette un checkout avec un panier vide", async () => {
    await expect(createCheckoutSession(sampleDraft, [])).rejects.toThrow();
  });

  it("rejette un checkout avec des informations client manquantes", async () => {
    const invalidDraft = {
      ...sampleDraft,
      customer: { ...sampleDraft.customer, email: "invalid-email" },
    };
    await expect(
      createCheckoutSession(invalidDraft, sampleItems),
    ).rejects.toThrow();
  });
});
