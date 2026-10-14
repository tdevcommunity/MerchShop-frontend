import { describe, expect, it, vi } from "vitest";
import { openPaymentCheckout } from "./payment-checkout-service";

const apiRequestMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiRequest: (...args: unknown[]) => apiRequestMock(...args),
}));

const laravelPayment = {
  uuid: "pay-1",
  orderId: "order-1",
  status: "pending",
  method: "mobile_money",
  amount: 5000,
  transactionId: "tnx_test",
  provider: "velto",
  checkoutUrl: "https://checkout.velto.test/session",
};

describe("openPaymentCheckout", () => {
  it("renvoie l'adresse de checkout", async () => {
    apiRequestMock.mockResolvedValue(laravelPayment);

    const { payment, checkoutUrl } = await openPaymentCheckout(
      "b5dfbe14-7865-42ac-a6db-e4e048696f51",
    );

    expect(checkoutUrl).toBe("https://checkout.velto.test/session");
    expect(payment.providerRef).toBe("tnx_test");
  });

  it("refuse une reponse sans checkoutUrl", async () => {
    apiRequestMock.mockResolvedValue({ ...laravelPayment, checkoutUrl: null });

    await expect(
      openPaymentCheckout("b5dfbe14-7865-42ac-a6db-e4e048696f51"),
    ).rejects.toThrow(/indisponible/i);
  });
});
