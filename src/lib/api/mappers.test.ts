import { describe, expect, it } from "vitest";
import {
  formatShippingAddress,
  mapLaravelCategoryToCategory,
  mapLaravelOrderStatus,
  mapLaravelOrderToOrder,
  mapLaravelPaymentStatus,
  mapLaravelProductToProduct,
  mapLaravelVariantToProductVariant,
  parseShippingAddress,
} from "./mappers";
import type {
  LaravelCategory,
  LaravelOrder,
  LaravelProduct,
  LaravelVariant,
} from "./types";

describe("API Mappers", () => {
  it("mappe une catégorie Laravel vers le modèle de domaine", () => {
    const rawCategory: LaravelCategory = {
      uuid: "11111111-1111-1111-1111-111111111111",
      name: "Textile",
      slug: "textile",
      description: "Vêtements officiels",
      status: "active",
      productsCount: 4,
    };

    const category = mapLaravelCategoryToCategory(rawCategory);
    expect(category).toEqual({
      slug: "textile",
      label: "Textile",
    });
  });

  it("mappe une variante Laravel vers le modèle de domaine", () => {
    const rawVariant: LaravelVariant = {
      uuid: "22222222-2222-2222-2222-222222222222",
      sku: "TEE-M-BLK",
      name: "M / Noir",
      size: "M",
      color: "Noir",
      price: 8000,
      stock: 15,
      status: "active",
      isAvailable: true,
    };

    const variant = mapLaravelVariantToProductVariant(
      rawVariant,
      "prod-uuid-1",
    );
    expect(variant).toEqual({
      id: "22222222-2222-2222-2222-222222222222",
      productId: "prod-uuid-1",
      size: "M",
      color: "Noir",
      sku: "TEE-M-BLK",
      stockQuantity: 15,
      unitPrice: 8000,
    });
  });

  it("mappe un produit Laravel complet avec ses variantes", () => {
    const rawProduct: LaravelProduct = {
      uuid: "prod-uuid-1",
      name: "T-shirt TDEV 2026",
      description: "Le t-shirt officiel",
      imageUrl: "https://example.com/tee.jpg",
      slug: "t-shirt-tdev-2026",
      status: "active",
      category: {
        uuid: "cat-uuid-1",
        name: "Textile",
        slug: "textile",
      },
      variants: [
        {
          uuid: "var-1",
          sku: "TEE-S-BLK",
          name: "S / Noir",
          size: "S",
          color: "Noir",
          price: 8000,
          stock: 5,
          status: "active",
          isAvailable: true,
        },
      ],
      priceFrom: 8000,
      isAvailable: true,
    };

    const product = mapLaravelProductToProduct(rawProduct);
    expect(product.id).toBe("prod-uuid-1");
    expect(product.name).toBe("T-shirt TDEV 2026");
    expect(product.category).toBe("textile");
    expect(product.categoryLabel).toBe("Textile");
    expect(product.variants).toHaveLength(1);
    expect(product.variants[0]?.id).toBe("var-1");
  });

  it("mappe les statuts de commande et paiement", () => {
    expect(mapLaravelOrderStatus(1)).toBe("awaiting_payment");
    expect(mapLaravelOrderStatus(2)).toBe("paid");
    expect(mapLaravelOrderStatus(3)).toBe("ready_for_pickup");
    expect(mapLaravelOrderStatus(4)).toBe("picked_up");
    expect(mapLaravelOrderStatus(5)).toBe("cancelled");
    expect(mapLaravelOrderStatus(6)).toBe("refunded");
    expect(mapLaravelOrderStatus(7)).toBe("refund_pending");

    expect(mapLaravelPaymentStatus(1)).toBe("pending");
    expect(mapLaravelPaymentStatus(2)).toBe("success");
    expect(mapLaravelPaymentStatus(3)).toBe("failed");
    expect(mapLaravelPaymentStatus(4)).toBe("refunded");
  });

  /*
   * L'API expose `status` en entier mais fait passer `paymentStatus` par une
   * closure typee `?string`, qui le convertit en chaine. Comparer directement
   * avec `case 1:` faisait donc retomber tout paiement sur `unknown`, et une
   * commande payee en paraissait ne pas l'etre. Les deux formes doivent donner
   * le meme resultat.
   */
  it("lit un statut numerique que l'API renvoie en chaine", () => {
    expect(mapLaravelOrderStatus("2")).toBe("paid");
    expect(mapLaravelOrderStatus("7")).toBe("refund_pending");
    expect(mapLaravelPaymentStatus("1")).toBe("pending");
    expect(mapLaravelPaymentStatus("2")).toBe("success");
    expect(mapLaravelPaymentStatus("3")).toBe("failed");
    expect(mapLaravelPaymentStatus("4")).toBe("refunded");
  });

  it("ne confond pas un statut absent avec un statut inconnu", () => {
    expect(mapLaravelPaymentStatus(null)).toBe("unknown");
    expect(mapLaravelPaymentStatus(undefined)).toBe("unknown");
  });

  it("mappe une commande Laravel vers une commande Frontend", () => {
    const rawOrder: LaravelOrder = {
      uuid: "ord-uuid-123",
      orderNumber: "TDEV-2026-0001",
      status: 2,
      fulfillmentMethod: "pickup",
      pickupStatus: "pending",
      pickupTime: null,
      participantId: null,
      subTotal: 8000,
      discount: 0,
      deliveryFee: 0,
      currency: "XOF",
      total: 8000,
      paymentStatus: 2,
      paymentMethod: "mobile_money",
      shippingAddress: null,
      items: [
        {
          uuid: "item-1",
          productUuid: "prod-1",
          variantUuid: "var-1",
          productName: "T-shirt",
          size: "M",
          color: "Noir",
          quantity: 1,
          unitPrice: 8000,
          totalPrice: 8000,
        },
      ],
      createdAt: "2026-10-01T12:00:00Z",
      updatedAt: "2026-10-01T12:01:00Z",
    };

    const order = mapLaravelOrderToOrder(rawOrder, {
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@example.com",
      phone: "+228 90 00 00 00",
    });

    expect(order.id).toBe("ord-uuid-123");
    expect(order.reference).toBe("TDEV-2026-0001");
    expect(order.status).toBe("paid");
    expect(order.paymentStatus).toBe("success");
    expect(order.deliveryMethod).toBe("pickup_event");
    expect(order.customer.firstName).toBe("Jean");
    expect(order.items).toHaveLength(1);
  });

  it("formate et parse l'adresse de livraison", () => {
    const formatted = formatShippingAddress({
      line1: "Rue 14",
      line2: "Apt 2B",
      city: "Lomé",
      country: "Togo",
    });
    expect(formatted).toBe("Rue 14, Apt 2B, Lomé, Togo");

    const parsed = parseShippingAddress("Boulevard du Mono, Lomé");
    expect(parsed?.line1).toBe("Boulevard du Mono, Lomé");
  });
});
