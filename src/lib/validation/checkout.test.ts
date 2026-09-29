import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/api/errors";
import {
  validateCardDetails,
  validateCheckoutDraft,
  validateCustomer,
  validateFulfillment,
  validateInformation,
  validatePayment,
} from "./checkout";
import { DELIVERY_METHODS } from "@/types/delivery";
import type { CheckoutDraft } from "@/types/checkout";

const validCustomer = {
  firstName: "Ama",
  lastName: "Koffi",
  email: "ama@example.com",
  phone: "+22890123456",
};

function draft(overrides: Partial<CheckoutDraft> = {}): CheckoutDraft {
  return {
    customer: validCustomer,
    deliveryMethod: DELIVERY_METHODS.PICKUP_EVENT,
    shippingAddress: null,
    paymentMethod: "mobile_money",
    mobileOperator: "mixx",
    ...overrides,
  };
}

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

  it("n'exige pas l'email aux coordonnées", () => {
    const fields = validateCustomer({
      ...validCustomer,
      email: "",
    });
    expect(fields.email).toBeUndefined();
  });

  it("n'exige pas le téléphone aux coordonnées", () => {
    const fields = validateCustomer({
      ...validCustomer,
      phone: "",
    });
    expect(fields.phone).toBeUndefined();
  });

  it("exige un mode de réception", () => {
    const fields = validateFulfillment(draft({ deliveryMethod: null }));
    expect(fields.deliveryMethod).toBeTruthy();
  });

  it("exige une adresse pour la livraison", () => {
    const fields = validateFulfillment(
      draft({
        deliveryMethod: DELIVERY_METHODS.DELIVERY,
        shippingAddress: null,
      }),
    );
    expect(fields.shipping).toBeTruthy();
  });

  it("accepte une localisation Maps sans saisie manuelle", () => {
    const fields = validateFulfillment(
      draft({
        deliveryMethod: DELIVERY_METHODS.DELIVERY,
        shippingAddress: {
          source: "maps",
          line1: "",
          city: "",
          country: "Togo",
          line2: "Aného, Togo",
          lat: 6.23,
          lng: 1.6,
        },
      }),
    );
    expect(fields).toEqual({});
  });

  it("n'exige pas les champs manuels si le lieu Maps est renseigné", () => {
    const fields = validateFulfillment(
      draft({
        deliveryMethod: DELIVERY_METHODS.DELIVERY,
        shippingAddress: {
          source: "maps",
          line1: "",
          city: "",
          country: "Togo",
          line2: "Aného, Togo",
        },
      }),
    );
    expect(fields.city).toBeUndefined();
    expect(fields.line1).toBeUndefined();
  });

  it("ne demande plus l'adresse aux coordonnées", () => {
    const fields = validateInformation(
      draft({
        deliveryMethod: DELIVERY_METHODS.DELIVERY,
        shippingAddress: null,
      }),
    );
    expect(fields.shipping).toBeUndefined();
    expect(fields.line1).toBeUndefined();
  });

  it("exige un moyen de paiement", () => {
    const fields = validatePayment(draft({ paymentMethod: null }));
    expect(fields.paymentMethod).toBeTruthy();
  });

  it("exige téléphone et opérateur pour Mobile Money", () => {
    const fields = validatePayment(
      draft({
        paymentMethod: "mobile_money",
        mobileOperator: null,
        customer: { ...validCustomer, phone: "" },
      }),
    );
    expect(fields.phone).toBeTruthy();
    expect(fields.mobileOperator).toBeTruthy();
  });

  it("n'exige pas le téléphone pour une carte", () => {
    const fields = validatePayment(
      draft({
        paymentMethod: "card",
        mobileOperator: null,
        customer: { ...validCustomer, phone: "" },
      }),
    );
    expect(fields.phone).toBeUndefined();
  });

  it("valide les champs carte mockés", () => {
    expect(
      validateCardDetails({
        holderName: "Ama Koffi",
        number: "4242424242424242",
        expiry: "12/99",
        cvc: "123",
      }),
    ).toEqual({});
    const fields = validateCardDetails({
      holderName: "",
      number: "123",
      expiry: "13/99",
      cvc: "12",
    });
    expect(fields.holderName).toBeTruthy();
    expect(fields.number).toBeTruthy();
    expect(fields.expiry).toBeTruthy();
    expect(fields.cvc).toBeTruthy();
  });

  it("accepte un draft retrait Jour J complet", () => {
    expect(() => validateCheckoutDraft(draft())).not.toThrow();
  });

  it("rejette un draft livraison sans adresse", () => {
    expect(() =>
      validateCheckoutDraft(
        draft({
          deliveryMethod: DELIVERY_METHODS.DELIVERY,
          shippingAddress: null,
        }),
      ),
    ).toThrow(ValidationError);
  });
});
