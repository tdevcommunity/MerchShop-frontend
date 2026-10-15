import { describe, expect, it } from "vitest";
import {
  ImageValidationError,
  MAX_SOURCE_IMAGE_BYTES,
  isAcceptedImageType,
  prepareImageForUpload,
  validateImageFile,
} from "./prepare-image";

/** Un fichier factice : la validation ne lit que `type` et `size`. */
function fakeFile(type: string, size: number): File {
  return { type, size, name: "photo.jpg" } as File;
}

describe("isAcceptedImageType", () => {
  it("accepte les formats que l'API prend en charge", () => {
    expect(isAcceptedImageType("image/jpeg")).toBe(true);
    expect(isAcceptedImageType("image/png")).toBe(true);
    expect(isAcceptedImageType("image/webp")).toBe(true);
  });

  it("accepte un type a la casse differente", () => {
    expect(isAcceptedImageType("IMAGE/PNG")).toBe(true);
  });

  it("refuse ce qu'un navigateur ne peut pas afficher comme image", () => {
    expect(isAcceptedImageType("application/pdf")).toBe(false);
    expect(isAcceptedImageType("image/svg+xml")).toBe(false);
    expect(isAcceptedImageType("")).toBe(false);
  });
});

describe("validateImageFile", () => {
  it("laisse passer une image valide", () => {
    expect(() => validateImageFile(fakeFile("image/jpeg", 1024))).not.toThrow();
  });

  it("refuse un format non accepte avec un message lisible", () => {
    expect(() => validateImageFile(fakeFile("application/pdf", 1024))).toThrow(
      ImageValidationError,
    );
    expect(() => validateImageFile(fakeFile("application/pdf", 1024))).toThrow(
      /format/i,
    );
  });

  it("refuse une image vide", () => {
    expect(() => validateImageFile(fakeFile("image/png", 0))).toThrow(/vide/i);
  });

  it("refuse une image au-dessus du plafond memoire", () => {
    expect(() =>
      validateImageFile(fakeFile("image/png", MAX_SOURCE_IMAGE_BYTES + 1)),
    ).toThrow(/trop lourde/i);
  });
});

describe("prepareImageForUpload", () => {
  it("rejette avant tout decodage une image invalide", async () => {
    await expect(
      prepareImageForUpload(fakeFile("application/pdf", 1024)),
    ).rejects.toBeInstanceOf(ImageValidationError);
  });
});
