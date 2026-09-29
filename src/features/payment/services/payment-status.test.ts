import { describe, expect, it } from "vitest";
import {
  isKnownPaymentStatus,
  isPaymentPending,
  isPaymentSuccess,
} from "./payment-status";

describe("payment status", () => {
  it("identifie le succès", () => {
    expect(isPaymentSuccess("success")).toBe(true);
    expect(isPaymentSuccess("pending")).toBe(false);
  });

  it("identifie les états d'attente", () => {
    expect(isPaymentPending("pending")).toBe(true);
    expect(isPaymentPending("processing")).toBe(true);
    expect(isPaymentPending("failed")).toBe(false);
  });

  it("valide le contrat de statut", () => {
    expect(isKnownPaymentStatus("unknown")).toBe(true);
    expect(isKnownPaymentStatus("paid")).toBe(false);
  });
});
