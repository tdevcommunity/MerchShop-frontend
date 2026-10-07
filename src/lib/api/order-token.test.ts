import { describe, expect, it } from "vitest";
import {
  getOrderGuestToken,
  saveOrderGuestToken,
} from "./order-token";

describe("Order Guest Token Store", () => {
  it("sauvegarde et récupère le jeton invité d'une commande", () => {
    const uuid = "33333333-3333-3333-3333-333333333333";
    const token = "guest-secret-token-xyz";

    expect(getOrderGuestToken(uuid)).toBeNull();

    saveOrderGuestToken(uuid, token);
    expect(getOrderGuestToken(uuid)).toBe(token);
  });

  it("gère les identifiants vides de manière sécurisée", () => {
    saveOrderGuestToken("", "some-token");
    expect(getOrderGuestToken("")).toBeNull();
  });
});
