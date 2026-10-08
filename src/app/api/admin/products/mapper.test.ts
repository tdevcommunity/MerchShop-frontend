import { describe, expect, it } from "vitest";
import { mapLaravelProduct } from "./mapper";

/**
 * La reponse d'ecriture (POST / PATCH) est devenue identique a celle de la
 * liste : c'est le contrat que l'ecran lit (`AdminProduct`). Ces tests
 * verifient la traduction depuis la forme brute de l'API, celle que les routes
 * d'ecriture recueillent avant de repondre.
 */
describe("mapLaravelProduct — reponse d'ecriture", () => {
  const rawResponse = {
    uuid: "11111111-1111-4111-8111-111111111111",
    name: "T-shirt TDEV",
    slug: "t-shirt-tdev",
    description: "Coton lourd",
    image_url: "https://res.cloudinary.com/demo/image/upload/tshirt.jpg",
    status: 1,
    category: {
      uuid: "22222222-2222-4222-8222-222222222222",
      name: "Textile",
      slug: "textile",
    },
    variants: [
      {
        uuid: "33333333-3333-4333-8333-333333333333",
        sku: "TSHIRT-M-NOIR",
        name: "M / Noir",
        size: "M",
        color: "Noir",
        imageUrl: "https://res.cloudinary.com/demo/image/upload/noir.jpg",
        colorHex: "#111111",
        price: 8000,
        stock: 12,
      },
    ],
    created_at: "2026-10-08T10:00:00+00:00",
  };

  it("rend le lien de l'image lisible par l'ecran (image_url → imageUrl)", () => {
    const product = mapLaravelProduct(rawResponse);

    expect(product.imageUrl).toBe("https://res.cloudinary.com/demo/image/upload/tshirt.jpg");
    expect(product.images).toEqual(["https://res.cloudinary.com/demo/image/upload/tshirt.jpg"]);
  });

  it("identifie le produit par uuid et range la categorie en slug + libelle", () => {
    const product = mapLaravelProduct(rawResponse);

    expect(product.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(product.category).toBe("textile");
    expect(product.categoryLabel).toBe("Textile");
  });

  it("traduit le statut entier en statut lisible par le badge", () => {
    expect(mapLaravelProduct(rawResponse).status).toBe("published");
    expect(mapLaravelProduct({ ...rawResponse, status: 0 }).status).toBe("draft");
  });

  it("traduit les variantes (imageUrl/price/stock → imageUrl/unitPrice/stockQuantity)", () => {
    const variants = mapLaravelProduct(rawResponse).variants;
    expect(variants).toHaveLength(1);
    const variant = variants.at(0);

    expect(variant?.id).toBe("33333333-3333-4333-8333-333333333333");
    expect(variant?.imageUrl).toBe("https://res.cloudinary.com/demo/image/upload/noir.jpg");
    expect(variant?.colorHex).toBe("#111111");
    expect(variant?.unitPrice).toBe(8000);
    expect(variant?.stockQuantity).toBe(12);
  });

  it("reste lisible sans image ni categorie", () => {
    const product = mapLaravelProduct({
      uuid: "44444444-4444-4444-8444-444444444444",
      name: "Casquette",
      slug: "casquette",
      status: 0,
      variants: [],
    });

    expect(product.imageUrl).toBeNull();
    expect(product.images).toEqual([]);
    expect(product.category).toBe("");
    expect(product.status).toBe("draft");
    expect(product.createdAt).toBe("");
  });
});
