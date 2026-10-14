import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSharedCheckoutOrder,
  getSharedOpenPaymentCheckout,
  resetSharedCheckoutOrder,
} from "@/features/checkout/utils/checkout-processing-session";

afterEach(() => {
  resetSharedCheckoutOrder();
});

describe("getSharedCheckoutOrder", () => {
  it("reuses the same creation promise", async () => {
    const create = vi.fn(async () => ({ id: "ord-1" } as never));

    const first = getSharedCheckoutOrder(create);
    const second = getSharedCheckoutOrder(create);

    expect(first).toBe(second);
    await first;
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe("getSharedOpenPaymentCheckout", () => {
  it("reuses the same open payment promise per order", async () => {
    const open = vi.fn(async () => ({
      checkoutUrl: "https://velto.test/pay",
      payment: {} as never,
    }));

    const first = getSharedOpenPaymentCheckout("ord-1", open);
    const second = getSharedOpenPaymentCheckout("ord-1", open);

    expect(first).toBe(second);
    await first;
    expect(open).toHaveBeenCalledTimes(1);
  });
});
