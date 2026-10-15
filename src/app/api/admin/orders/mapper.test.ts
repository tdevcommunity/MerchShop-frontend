import { describe, expect, it } from "vitest";
import { mapLaravelOrder } from "./mapper";

const baseOrder = {
  uuid: "order-1",
  orderNumber: "MS-0402",
  customerName: "Ama Koffi",
  customerPhoneNumber: "90112233",
  total: 8000,
  createdAt: "2026-10-01T10:00:00Z",
  items: [
    {
      productUuid: "prod-1",
      variantUuid: "var-1",
      productName: "Tee-shirt",
      variantName: "Noir / M",
      quantity: 2,
      unitPrice: 4000,
    },
  ],
};

describe("mapLaravelOrder", () => {
  it("convertit le statut entier de l'API en statut de l'ecran", () => {
    // L'API expose `status` en entier ; l'ecran compare des chaines.
    expect(mapLaravelOrder({ ...baseOrder, status: 2 }).status).toBe("paid");
    expect(mapLaravelOrder({ ...baseOrder, status: 3 }).status).toBe(
      "ready_for_pickup",
    );
  });

  it("convertit le statut de paiement, entier ou en chaine", () => {
    expect(
      mapLaravelOrder({ ...baseOrder, status: 2, paymentStatus: 2 }).paymentStatus,
    ).toBe("success");
    expect(
      mapLaravelOrder({ ...baseOrder, status: 2, paymentStatus: "1" })
        .paymentStatus,
    ).toBe("pending");
  });

  it("retombe sur un statut lisible quand le paiement est absent", () => {
    expect(mapLaravelOrder({ ...baseOrder, status: 2 }).paymentStatus).toBe(
      "unknown",
    );
  });

  it("traduit le mode de retrait Laravel en mode de l'ecran", () => {
    expect(
      mapLaravelOrder({ ...baseOrder, fulfillmentMethod: "pickup" }).deliveryMethod,
    ).toBe("pickup_event");
    expect(
      mapLaravelOrder({ ...baseOrder, fulfillmentMethod: "delivery" })
        .deliveryMethod,
    ).toBe("delivery");
  });

  it("decoupe le nom du client et mappe les lignes", () => {
    const order = mapLaravelOrder({ ...baseOrder, status: 1 });
    expect(order.reference).toBe("MS-0402");
    expect(order.customer.firstName).toBe("Ama");
    expect(order.customer.lastName).toBe("Koffi");
    expect(order.items).toHaveLength(1);
    expect(order.items[0]?.productName).toBe("Tee-shirt");
  });
});
