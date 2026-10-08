import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LaravelProduct } from "@/lib/api/types";

/**
 * Regression : la reponse Laravel expose `uuid` et non `id`. Si le service
 * catalogue caste la charge utile brute en `Product[]` au lieu de la mapper,
 * `product.id` vaut undefined, les `key` React dupliquent et l'accueil affiche
 * le warning "Each child in a list should have a unique key prop".
 *
 * Ces tests visent le comportement reel du service : il n'existe plus de branche
 * mock, donc le client HTTP est simule et rien d'autre ne doit l'etre.
 */
const rawProducts: LaravelProduct[] = [
  {
    uuid: "uuid-casquette",
    name: "Casquette TDEV",
    description: "Casquette brodee.",
    imageUrl: null,
    slug: "casquette-tdev",
    status: "1",
    category: { uuid: "cat-1", name: "Accessoires", slug: "accessoires" },
    variants: [],
  },
  {
    uuid: "uuid-hoodie",
    name: "Hoodie TDEV Night",
    description: "Hoodie officiel.",
    imageUrl: null,
    slug: "hoodie-tdev-night",
    status: "1",
    category: { uuid: "cat-1", name: "Accessoires", slug: "accessoires" },
    variants: [],
  },
  {
    uuid: "uuid-tote",
    name: "Totebag TDEV",
    description: "Sac en toile.",
    imageUrl: null,
    slug: "totebag-tdev",
    status: "1",
    category: { uuid: "cat-2", name: "Bagagerie", slug: "bagagerie" },
    variants: [],
  },
];

describe("mappe les champs image Laravel", () => {
  it("utilise image_url pour le catalogue public", async () => {
    apiRequestMock.mockResolvedValue([
      {
        ...rawProducts[0],
        imageUrl: undefined,
        image_url: "https://res.cloudinary.com/demo/image/upload/tdev.jpg",
      },
    ]);

    const products = await listProducts();

    expect(products[0]?.imageUrl).toBe(
      "https://res.cloudinary.com/demo/image/upload/tdev.jpg",
    );
  });
});

const apiRequestMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiRequest: (...args: unknown[]) => apiRequestMock(...args),
}));

const { listProducts, listShopCategories } = await import(
  "@/features/catalog/services/catalog-service"
);

describe("listProducts()", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it("mappe la charge utile Laravel et expose un id par produit", async () => {
    apiRequestMock.mockResolvedValue(rawProducts);

    const products = await listProducts();

    expect(apiRequestMock).toHaveBeenCalledWith("/api/v1/products");
    expect(products.map((product) => product.id)).toEqual([
      "uuid-casquette",
      "uuid-hoodie",
      "uuid-tote",
    ]);
  });

  it("ne produit aucune cle React dupliquee ni undefined", async () => {
    apiRequestMock.mockResolvedValue(rawProducts);

    const products = await listProducts();
    const keys = products.map((product) => product.id);

    expect(keys).not.toContain(undefined);
    expect(new Set(keys).size).toBe(products.length);
  });

  it("renvoie une liste vide si la reponse est absente", async () => {
    apiRequestMock.mockResolvedValue(undefined);

    await expect(listProducts()).resolves.toEqual([]);
  });

  it("applique le filtre de categorie sur le slug mappe, pas sur l'objet brut", async () => {
    apiRequestMock.mockResolvedValue(rawProducts);

    const products = await listProducts({ category: "bagagerie" });

    expect(products.map((product) => product.name)).toEqual(["Totebag TDEV"]);
  });
});

describe("listShopCategories()", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it("mappe name vers label, sans quoi les filtres s'affichent vides", async () => {
    apiRequestMock.mockResolvedValue([
      {
        uuid: "cat-1",
        name: "Accessoires",
        description: null,
        slug: "accessoires",
        status: "1",
      },
    ]);

    await expect(listShopCategories()).resolves.toEqual([
      { slug: "accessoires", label: "Accessoires" },
    ]);
  });
});