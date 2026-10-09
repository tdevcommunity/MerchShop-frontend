import { describe, expect, it } from "vitest";
import {
  displayProductImageSrc,
  isCloudinaryProductImage,
  withCloudinaryDelivery,
} from "./image-src";

describe("withCloudinaryDelivery", () => {
  const original =
    "https://res.cloudinary.com/demo/image/upload/v1710000000/merch-shop/products/tee.jpg";

  it("injecte f_auto et q_auto pour Cloudinary", () => {
    expect(withCloudinaryDelivery(original)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1710000000/merch-shop/products/tee.jpg",
    );
  });

  it("ajoute une largeur limite quand demandée", () => {
    expect(withCloudinaryDelivery(original, { width: 800 })).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_800/v1710000000/merch-shop/products/tee.jpg",
    );
  });

  it("ne double pas les transformations", () => {
    const already =
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/x.jpg";
    expect(withCloudinaryDelivery(already)).toBe(already);
  });

  it("laisse intactes les URLs hors Cloudinary", () => {
    expect(withCloudinaryDelivery("https://drive.google.com/uc?export=view&id=1")).toBe(
      "https://drive.google.com/uc?export=view&id=1",
    );
  });
});

describe("displayProductImageSrc", () => {
  it("enchaine normalisation Drive et livraison Cloudinary", () => {
    expect(
      displayProductImageSrc(
        "https://res.cloudinary.com/demo/image/upload/v1/p.jpg",
        { width: 400 },
      ),
    ).toContain("/f_auto,q_auto,c_limit,w_400/");
  });
});

describe("isCloudinaryProductImage", () => {
  it("reconnait le host Cloudinary upload", () => {
    expect(
      isCloudinaryProductImage(
        "https://res.cloudinary.com/demo/image/upload/v1/p.jpg",
      ),
    ).toBe(true);
    expect(isCloudinaryProductImage("https://example.com/p.jpg")).toBe(false);
  });
});
