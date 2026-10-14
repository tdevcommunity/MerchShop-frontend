import { describe, expect, it } from "vitest";
import {
  isOrderAwaitingPayment,
  isOrderPaid,
} from "@/features/order/utils/order-payment-state";
import type { Order } from "@/types/order";

function baseOrder(overrides: Partial<Order>): Order {
  return {
    id: "ord-1",
    orderNumber: "MS-001",
    status: "awaiting_payment",
    paymentStatus: "pending",
    fulfillmentMethod: "pickup",
    currency: "XOF",
    subtotal: 2500,
    total: 2500,
    items: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Order;
}

describe("isOrderPaid", () => {
  it("requires payment success for a standard awaiting order", () => {
    expect(
      isOrderPaid(
        baseOrder({ status: "paid", paymentStatus: "pending" }),
      ),
    ).toBe(false);
  });

  it("accepts explicit payment success", () => {
    expect(
      isOrderPaid(
        baseOrder({ status: "awaiting_payment", paymentStatus: "success" }),
      ),
    ).toBe(true);
  });

  it("accepts fulfillment statuses when payment is not pending", () => {
    expect(
      isOrderPaid(
        baseOrder({ status: "ready_for_pickup", paymentStatus: "success" }),
      ),
    ).toBe(true);
  });
});

describe("isOrderAwaitingPayment", () => {
  it("treats paid status with pending payment as awaiting", () => {
    expect(
      isOrderAwaitingPayment(
        baseOrder({ status: "paid", paymentStatus: "pending" }),
      ),
    ).toBe(true);
  });
});
