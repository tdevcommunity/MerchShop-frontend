import { describe, expect, it } from "vitest";
import {
  getProductBySlug,
  listProducts,
  listShopCategories,
} from "./catalog-service";

describe("catalog-service", () => {
  it("retourne les catégories du shop (mode mock)", async () => {
    const categories = await listShopCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty("slug");
    expect(categories[0]).toHaveProperty("label");
  });

  it("retourne la liste des produits publiés (mode mock)", async () => {
    const products = await listProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty("id");
    expect(products[0]).toHaveProperty("name");
    expect(products[0]).toHaveProperty("variants");
  });

  it("filtre les produits par catégorie (mode mock)", async () => {
    const products = await listProducts({ category: "textile" });
    for (const p of products) {
      expect(p.category).toBe("textile");
    }
  });

  it("récupère un produit par son slug (mode mock)", async () => {
    const products = await listProducts();
    const first = products[0];
    if (first) {
      const product = await getProductBySlug(first.slug);
      expect(product.id).toBe(first.id);
      expect(product.name).toBe(first.name);
    }
  });

  it("lève une erreur 404 pour un produit inexistant", async () => {
    await expect(getProductBySlug("slug-inexistant-12345")).rejects.toThrow(
      /introuvable/i,
    );
  });
});
