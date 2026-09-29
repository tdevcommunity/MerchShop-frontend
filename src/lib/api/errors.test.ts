import { describe, expect, it } from "vitest";
import {
  ApiError,
  NetworkError,
  isNotFoundError,
  toUserMessage,
  NotFoundError,
} from "./errors";

describe("api errors", () => {
  it("expose un message utilisateur pour les erreurs métier", () => {
    expect(toUserMessage(new NetworkError())).toMatch(/réseau/i);
    expect(toUserMessage(new Error("stack leak"))).toBe(
      "Une erreur inattendue s'est produite.",
    );
  });

  it("détecte les 404", () => {
    expect(isNotFoundError(new NotFoundError())).toBe(true);
    expect(isNotFoundError(new ApiError(404, "missing"))).toBe(true);
    expect(isNotFoundError(new ApiError(500, "boom"))).toBe(false);
  });
});
