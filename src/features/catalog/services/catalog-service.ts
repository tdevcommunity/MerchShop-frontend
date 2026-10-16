import { apiRequest, apiRequestAll } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import type { CatalogFilters, Category, Product } from "@/types/catalog";
import {
  mapLaravelCategoryToCategory,
  mapLaravelProductToProduct,
} from "@/lib/api/mappers";
import type { LaravelCategory, LaravelProduct } from "@/lib/api/types";

export async function listShopCategories(): Promise<Category[]> {
  // L'API renvoie la forme Laravel (uuid / name) : le mapping est obligatoire,
  // sinon `label` reste undefined et les filtres s'affichent vides. Elle est
  // paginee : lire une seule page tronquerait le menu de categories.
  const rawCategories = await apiRequestAll<LaravelCategory>(
    apiEndpoints.categories,
  );
  return rawCategories.map(mapLaravelCategoryToCategory);
}

export async function listProducts(
  filters: CatalogFilters = {},
): Promise<Product[]> {
  /*
   * Le filtre de categorie est resolu par l'API (`?category=<slug>`), pas cote
   * client. Le front chargeait auparavant la premiere page du catalogue (15
   * elements) puis filtrait lui-meme : des que le shop depassait une page, une
   * categorie dont les produits tombaient plus loin s'affichait vide.
   *
   * On parcourt en plus toutes les pages : la grille affiche l'integralite de
   * la categorie, comme avant, mais sur l'ensemble du catalogue et non sur sa
   * premiere tranche.
   */
  const path = filters.category
    ? `${apiEndpoints.products}?category=${encodeURIComponent(filters.category)}`
    : apiEndpoints.products;

  // La reponse Laravel expose `uuid` et non `id`. Sans mapping, `product.id`
  // vaut undefined et les `key` React dupliquent.
  const products = (await apiRequestAll<LaravelProduct>(path)).map(
    mapLaravelProductToProduct,
  );

  // La recherche libre reste un filtre d'affichage : elle porte sur le nom, la
  // couleur, la taille et le SKU, et se combine a la categorie deja filtree.
  return products.filter((product) => {
    if (filters.query) {
      const query = filters.query.toLowerCase();
      return product.name.toLowerCase().includes(query);
    }
    return true;
  });
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const rawProduct = await apiRequest<LaravelProduct>(
    apiEndpoints.productBySlug(slug),
  );
  if (!rawProduct) {
    throw new NotFoundError("Ce produit est introuvable.");
  }
  return mapLaravelProductToProduct(rawProduct);
}

export async function getProductById(uuid: string): Promise<Product> {
  const rawProduct = await apiRequest<LaravelProduct>(
    apiEndpoints.productByUuid(uuid),
  );
  if (!rawProduct) {
    throw new NotFoundError("Ce produit est introuvable.");
  }
  return mapLaravelProductToProduct(rawProduct);
}
