import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCheckoutSession } from "./checkout-service";
import type { CartItem } from "@/types/cart";
import type { CheckoutDraft } from "@/types/checkout";

/**
 * Contrat de `POST /api/v1/orders`, tel que l'API l'exige.
 *
 * Ces tests verrouillent la charge utile envoyee : l'API refuse une commande
 * sans `customer_name` ni `customer_phone_number` (422), et elle nomme ses
 * champs en snake_case avec `uuid` de variante. Une divergence ici ne se voit
 * pas au typage — `checkout-service` declare `body: unknown` — elle ne se voit
 * qu'a l'execution, sur une commande refusee.
 */
const laravelOrder = {
  uuid: "b5dfbe14-7865-42ac-a6db-e4e048696f51",
  orderNumber: "TDEV-20261005-H1XHAV",
  status: 1,
  fulfillmentMethod: "pickup",
  pickupStatus: "pending",
  pickupTime: null,
  participantId: null,
  subTotal: 8000,
  discount: 0,
  deliveryFee: 0,
  currency: "XOF",
  total: 8000,
  // L'API fait passer ce statut par une closure typee `?string` : il arrive en
  // chaine, alors que `status` arrive en entier.
  paymentStatus: "1",
  paymentMethod: "mobile_money",
  shippingAddress: null,
  items: [
    {
      uuid: "item-1",
      productUuid: "prod-tee",
      variantUuid: "var-tee-m",
      productName: "T-Shirt TDEV 2026",
      productCategory: "Textile",
      size: "M",
      color: "Noir",
      variantName: "M / Noir",
      quantity: 1,
      unitPrice: 8000,
      totalPrice: 8000,
    },
  ],
  guestAccessToken: "jeton-invite",
  createdAt: "2026-10-05T19:47:24+00:00",
  updatedAt: "2026-10-05T19:47:24+00:00",
};

let capturedBody: Record<string, unknown> | null = null;

function stubFetch(status = 201) {
  vi.stubGlobal("fetch", async (_url: string, options?: RequestInit) => {
    if (options?.body) {
      capturedBody = JSON.parse(options.body as string) as Record<string, unknown>;
    }
    if (status === 201) {
      return {
        ok: true,
        status: 201,
        json: async () => ({ data: laravelOrder }),
      };
    }
    return {
      ok: false,
      status,
      json: async () => ({
        error: {
          code: "VALIDATION_ERROR",
          message: "Les données envoyées sont invalides.",
          details: {
            fields: {
              customer_name: ["Le nom de l'acheteur est obligatoire."],
            },
          },
        },
      }),
    };
  });
}

const sampleDraft: CheckoutDraft = {
  customer: {
    firstName: "Komi",
    lastName: "Agbeko",
    email: "komi@example.test",
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

describe("createCheckoutSession", () => {
  beforeEach(() => {
    capturedBody = null;
    stubFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envoie l'identite de l'acheteur, sans laquelle l'API refuse la commande", async () => {
    await createCheckoutSession(sampleDraft, sampleItems);

    // L'API concatene ces deux champs en un seul nom complet ; sans eux elle
    // repond 422 et aucune commande n'est creee.
    expect(capturedBody?.customer_name).toBe("Komi Agbeko");
    expect(capturedBody?.customer_phone_number).toBe("+228 90 12 34 56");
  });

  it("envoie les items par uuid de variante, et non par identifiant produit", async () => {
    await createCheckoutSession(sampleDraft, sampleItems);

    expect(capturedBody?.items).toEqual([{ uuid: "var-tee-m", quantity: 1 }]);
  });

  it("traduit le mode de reception vers la valeur comprise par l'API", async () => {
    await createCheckoutSession(sampleDraft, sampleItems);

    expect(capturedBody?.fulfillment_method).toBe("pickup");
    expect(capturedBody?.shipping_address).toBeNull();
  });

  it("exige une adresse quand la commande est livree", async () => {
    await createCheckoutSession(
      {
        ...sampleDraft,
        deliveryMethod: "delivery",
        shippingAddress: {
          source: "manual",
          line1: "Quartier Hédzranawoe",
          city: "Lomé",
          country: "Togo",
        } as CheckoutDraft["shippingAddress"],
      },
      sampleItems,
    );

    expect(capturedBody?.fulfillment_method).toBe("delivery");
    expect(capturedBody?.shipping_address).toContain("Lomé");
  });

  it("mappe la reponse Laravel, statut de paiement en chaine compris", async () => {
    const order = await createCheckoutSession(sampleDraft, sampleItems);

    expect(order.id).toBe("b5dfbe14-7865-42ac-a6db-e4e048696f51");
    expect(order.reference).toBe("TDEV-20261005-H1XHAV");
    expect(order.status).toBe("awaiting_payment");
    // Sans normalisation, "1" ne rejoindrait aucun `case 1:` et le statut
    // retomberait sur `unknown`.
    expect(order.paymentStatus).toBe("pending");
    expect(order.items).toHaveLength(1);
    expect(order.total).toBe(8000);
    expect(order.deliveryMethod).toBe("pickup_event");
  });

  it("conserve l'identite saisie au checkout, l'API ne la renvoyant pas", async () => {
    const order = await createCheckoutSession(sampleDraft, sampleItems);

    expect(order.customer.firstName).toBe("Komi");
    expect(order.customer.lastName).toBe("Agbeko");
  });

  it("rejette un checkout avec un panier vide", async () => {
    await expect(createCheckoutSession(sampleDraft, [])).rejects.toThrow();
  });

  it("rejette un checkout dont le telephone est manquant", async () => {
    const invalidDraft = {
      ...sampleDraft,
      customer: { ...sampleDraft.customer, phone: "" },
    };

    await expect(
      createCheckoutSession(invalidDraft, sampleItems),
    ).rejects.toThrow();
  });

  it("remonte le refus de l'API quand elle refuse la commande", async () => {
    stubFetch(422);

    await expect(createCheckoutSession(sampleDraft, sampleItems)).rejects.toThrow();
  });
});
