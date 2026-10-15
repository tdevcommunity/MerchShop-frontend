import { describe, expect, it } from "vitest";
import {
  ApiError,
  NetworkError,
  isNotFoundError,
  toUserMessage,
  userMessageForApiError,
  NotFoundError,
  ValidationError,
} from "./errors";

describe("api errors", () => {
  it("expose un message utilisateur pour les erreurs métier", () => {
    expect(toUserMessage(new NetworkError())).toMatch(/réseau/i);
    expect(toUserMessage(new Error("stack leak"))).toBe(
      "Une erreur inattendue s'est produite.",
    );
  });

  it("masque les messages techniques de l'API", () => {
    expect(
      toUserMessage(
        new ApiError(502, "PAYMENT_PROVIDER_UNAVAILABLE detail", "PAYMENT_PROVIDER_UNAVAILABLE"),
      ),
    ).toMatch(/indisponible/i);
    expect(userMessageForApiError(502, "UNKNOWN_CODE")).toMatch(/indisponible/i);
    expect(userMessageForApiError(404, "NOT_FOUND")).toMatch(/introuvable/i);
  });

  it("garde un message générique pour la validation", () => {
    expect(
      toUserMessage(new ValidationError({ email: "Email invalide." })),
    ).toMatch(/invalides/i);
  });

  it("détecte les 404", () => {
    expect(isNotFoundError(new NotFoundError())).toBe(true);
    expect(isNotFoundError(new ApiError(404, "missing"))).toBe(true);
    expect(isNotFoundError(new ApiError(500, "boom"))).toBe(false);
  });
});
