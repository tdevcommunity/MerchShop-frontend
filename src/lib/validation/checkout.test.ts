import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/api/errors";
import {
  validateCheckoutDraft,
  validateCustomer,
} from "./checkout";
import { DELIVERY_METHODS } from "@/types/delivery";
import type { CheckoutDraft } from "@/types/checkout";

const validCustomer = {
  firstName: "Ama",
  lastName: "Koffi",
  email: "ama@example.com",
  phone: "+22890123456",
};

describe("checkout validation", () => {
  it("rejette un client incomplet", () => {
    const fields = validateCustomer({
      firstName: "",
      lastName: "",
      email: "nope",
      phone: "1",
    });
    expect(fields.firstName).toBeTruthy();
    expect(fields.email).toBeTruthy();
    expect(fields.phone).toBeTruthy();
  });

  it("accepte un draft retrait Jour J", () => {
    const draft: CheckoutDraft = {
      customer: validCustomer,
      deliveryMethod: DELIVERY_METHODS.PICKUP_EVENT,
      shippingAddress: null,
    };
    expect(() => validateCheckoutDraft(draft)).not.toThrow();
  });

  it("exige une adresse pour la livraison", () => {
    const draft: CheckoutDraft = {
      customer: validCustomer,
      deliveryMethod: DELIVERY_METHODS.DELIVERY,
      shippingAddress: null,
    };
    expect(() => validateCheckoutDraft(draft)).toThrow(ValidationError);
  });
});
