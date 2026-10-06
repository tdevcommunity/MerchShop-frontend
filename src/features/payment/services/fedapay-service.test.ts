import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { openFedapayCheckout } from "./fedapay-service";

/**
 * L'adresse de reglement FedaPay est la seule chose qui fait avancer le tunnel :
 * sans elle, l'acheteur n'a nulle part ou aller. Elle est aussi la seule voie
 * d'y aller — le client ne choisit ni l'agregateur, ni le moyen de paiement chez
 * l'operateur.
 */
function stubPayment(payload: unknown, status = 200) {
  vi.stubGlobal("fetch", async () => ({
    ok: status < 400,
    status,
    json: async () => ({ data: payload }),
  }));
}

const laravelPayment = {
  uuid: "559191b4-5753-41c4-b445-c8d8250a7c77",
  orderId: "b5dfbe14-7865-42ac-a6db-e4e048696f51",
  participantId: null,
  currency: "XOF",
  amount: 5000,
  method: "mobile_money",
  provider: "fedapay",
  status: 1,
  transactionId: "trx_1sw_1791229963315",
  failureReason: null,
  checkoutUrl: "https://sandbox-process.fedapay.com/jeton",
  createdAt: "2026-10-05T19:47:24+00:00",
  paidAt: null,
  failedAt: null,
};

describe("openFedapayCheckout", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ouvre le reglement sur la commande et rend l'adresse a suivre", async () => {
    stubPayment(laravelPayment);

    const { payment, checkoutUrl } = await openFedapayCheckout(
      "b5dfbe14-7865-42ac-a6db-e4e048696f51",
    );

    expect(checkoutUrl).toBe("https://sandbox-process.fedapay.com/jeton");
    expect(payment.id).toBe("559191b4-5753-41c4-b445-c8d8250a7c77");
    // La tentative existe mais n'est pas encore encaissée : le paiement ne se
    // declare jamais sur la seule foi de l'ouverture de la page.
    expect(payment.status).toBe("pending");
    expect(payment.providerRef).toBe("trx_1sw_1791229963315");
  });

  it("refuse d'ouvrir un reglement sans adresse a suivre", async () => {
    stubPayment({ ...laravelPayment, checkoutUrl: null });

    await expect(
      openFedapayCheckout("b5dfbe14-7865-42ac-a6db-e4e048696f51"),
    ).rejects.toThrow(/prestataire de paiement/i);
  });

  it("remonte le refus de l'API quand le prestataire est indisponible", async () => {
    // L'API renvoie ses erreurs hors de l'enveloppe `data`, contrairement a
    // ses reponses de succes.
    vi.stubGlobal("fetch", async () => ({
      ok: false,
      status: 503,
      json: async () => ({
        error: {
          code: "PAYMENT_PROVIDER_NOT_CONFIGURED",
          message: "Le prestataire de paiement est indisponible.",
          details: { provider: "fedapay" },
        },
      }),
    }));

    await expect(
      openFedapayCheckout("b5dfbe14-7865-42ac-a6db-e4e048696f51"),
    ).rejects.toThrow(/indisponible/i);
  });
});
