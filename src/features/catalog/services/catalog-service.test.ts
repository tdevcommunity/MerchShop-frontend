import { describe, expect, it } from "vitest";
import {
  getProductBySlug,
  listProducts,
  listShopCategories,
} from "./catalog-service";

/*
 * Test d'integration : il interroge la vraie API, sans mock.
 *
 * Il ne s'execute que si NEXT_PUBLIC_API_BASE_URL est defini, car une CI isolee
 * n'a pas d'API joignable (les appels echouent en NetworkError). Le reste de la
 * suite (_mapping.test.ts) couvre le meme service avec un client simule.
 *
 *   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run test:integration
 */
const liveDescribe = process.env.NEXT_PUBLIC_API_BASE_URL ? describe : describe.skip;

liveDescribe("catalog-service (API reelle)", () => {
  it("retourne les catégories du shop via l'API", async () => {
    const categories = await listShopCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty("slug");
    expect(categories[0]).toHaveProperty("label");
  });

  it("retourne la liste des produits publiés via l'API", async () => {
    const products = await listProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty("id");
    expect(products[0]).toHaveProperty("name");
    expect(products[0]).toHaveProperty("variants");
  });

  it("filtre les produits par catégorie via l'API", async () => {
    const products = await listProducts({ category: "textile" });
    for (const p of products) {
      expect(p.category).toBe("textile");
    }
  });

  it("récupère un produit par son slug via l'API", async () => {
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
