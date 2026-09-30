import { beforeEach, describe, expect, it } from "vitest";
import { ORDER_TRANSITIONS } from "@/types/admin";
import type { Order } from "@/types/order";
import {
  adjustInventory,
  changeOrderStatus,
  createProduct,
  findPublishedProduct,
  listInventoryLogs,
  listPublishedProducts,
  recordPaidOrder,
  resetShopStore,
  updateProduct,
  validatePickup,
} from "./shop-store";

const admin = { id: "usr_admin", email: "admin@tdev.tg" };

function paidOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "ord_test_1",
    reference: "TDEV-TEST01",
    status: "paid",
    items: [
      {
        productId: "prod_tee_core",
        variantId: "var_tee_m_black",
        productName: "T-shirt TDEV Core",
        variantLabel: "Noir · M",
        size: "M",
        color: "Noir",
        quantity: 2,
        unitPrice: 8000,
      },
    ],
    total: 16000,
    paymentStatus: "success",
    paymentMethod: "mobile_money",
    customer: {
      firstName: "Ama",
      lastName: "Koffi",
      email: "ama@example.com",
      phone: "+22890123456",
    },
    deliveryMethod: "pickup_event",
    shippingAddress: null,
    pickupLabel: "Stand Merch",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("shop-store catalogue", () => {
  beforeEach(() => {
    resetShopStore();
  });

  it("crée, publie et rend un produit visible dans le Shop", () => {
    const product = createProduct(admin, {
      name: "Tote TDEV Audit",
      slug: "tote-tdev-audit",
      description: "Tote de test",
      category: "bagagerie",
      status: "draft",
      variants: [
        {
          size: null,
          color: "Noir",
          sku: "TOTE-AUDIT-BLK",
          stockQuantity: 12,
          unitPrice: 5000,
        },
      ],
    });

    expect(findPublishedProduct(product.slug)).toBeUndefined();

    updateProduct(admin, product.id, { status: "published" });

    expect(findPublishedProduct(product.slug)?.name).toBe("Tote TDEV Audit");
    expect(listPublishedProducts().some((item) => item.slug === product.slug)).toBe(true);
  });

  it("refuse un SKU déjà utilisé", () => {
    expect(() =>
      createProduct(admin, {
        name: "Clone",
        description: "x",
        category: "textile",
        variants: [
          {
            size: "M",
            color: "Noir",
            sku: "TEE-CORE-M-BLK",
            stockQuantity: 1,
            unitPrice: 8000,
          },
        ],
      }),
    ).toThrow(/SKU/);
  });

  it("refuse un prix nul", () => {
    expect(() =>
      createProduct(admin, {
        name: "Gratuit",
        description: "x",
        category: "textile",
        variants: [
          {
            size: "M",
            color: "Blanc",
            sku: "FREE-M-WHT",
            stockQuantity: 1,
            unitPrice: 0,
          },
        ],
      }),
    ).toThrow(/prix/);
  });
});

describe("shop-store stock", () => {
  beforeEach(() => {
    resetShopStore();
  });

  it("augmente le stock et écrit l'historique", () => {
    const log = adjustInventory(admin, "var_tee_m_black", 10, "reception", "Réception");
    expect(log.previousStock).toBe(24);
    expect(log.nextStock).toBe(34);
    expect(listInventoryLogs()[0]?.note).toBe("Réception");
  });

  it("refuse un stock négatif", () => {
    expect(() => adjustInventory(admin, "var_tee_s_black", -999, "loss")).toThrow(/négatif/);
  });

  it("décrémente le stock à la vente", () => {
    recordPaidOrder(paidOrder(), "mobile_money");
    const log = listInventoryLogs().find((item) => item.reason === "sale");
    expect(log?.delta).toBe(-2);
    expect(log?.nextStock).toBe(22);
  });
});

describe("shop-store commandes", () => {
  beforeEach(() => {
    resetShopStore();
  });

  it("interdit une transition PICKED_UP → PENDING", () => {
    recordPaidOrder(paidOrder(), "mobile_money");
    changeOrderStatus(admin, "ord_test_1", "ready_for_pickup");
    validatePickup(admin, "ord_test_1");
    expect(() => changeOrderStatus(admin, "ord_test_1", "awaiting_payment")).toThrow(
      /interdite/,
    );
    expect(ORDER_TRANSITIONS.picked_up).toEqual([]);
  });

  it("refuse un second retrait", () => {
    recordPaidOrder(paidOrder(), "mobile_money");
    changeOrderStatus(admin, "ord_test_1", "ready_for_pickup");
    validatePickup(admin, "ord_test_1");
    expect(() => validatePickup(admin, "ord_test_1")).toThrow(/déjà été retirée/);
  });
});
