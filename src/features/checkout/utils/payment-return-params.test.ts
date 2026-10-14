import { describe, expect, it } from "vitest";
import {
  isOperatorPaymentAbandoned,
  isOperatorReturnWithoutSuccess,
  operatorReturnStatus,
} from "@/features/checkout/utils/payment-return-params";

describe("payment return params", () => {
  it("detects Velto abandon via close=true with pending status", () => {
    const params = new URLSearchParams(
      "status=pending&close=true&transaction_id=tnx_1",
    );
    expect(operatorReturnStatus(params)).toBe("pending");
    expect(isOperatorPaymentAbandoned(params)).toBe(true);
  });

  it("detects explicit cancelled status", () => {
    const params = new URLSearchParams("status=cancelled");
    expect(isOperatorPaymentAbandoned(params)).toBe(true);
  });

  it("does not treat approved return as abandoned", () => {
    const params = new URLSearchParams("status=approved");
    expect(isOperatorPaymentAbandoned(params)).toBe(false);
  });

  it("treats pending return as checkout exit without success", () => {
    const params = new URLSearchParams("status=pending&transaction_id=tnx_1");
    expect(isOperatorReturnWithoutSuccess(params)).toBe(true);
  });
});
