import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import { categorySlug } from "@/features/catalog/utils";
import type { CatalogFilters, Category, Product } from "@/types/catalog";
import {
  mapLaravelCategoryToCategory,
  mapLaravelProductToProduct,
} from "@/lib/api/mappers";
import type { LaravelCategory, LaravelProduct } from "@/lib/api/types";

export async function listShopCategories(): Promise<Category[]> {
  // L'API renvoie la forme Laravel (uuid / name) : le mapping est obligatoire,
  // sinon `label` reste undefined et les filtres s'affichent vides.
  const rawCategories = await apiRequest<LaravelCategory[]>(
    apiEndpoints.categories,
  );
  return (rawCategories ?? []).map(mapLaravelCategoryToCategory);
}

export async function listProducts(
  filters: CatalogFilters = {},
): Promise<Product[]> {
  // Idem : la reponse Laravel expose `uuid` et non `id`. Sans mapping,
  // `product.id` vaut undefined et les `key` React dupliquent.
  const products = (
    (await apiRequest<LaravelProduct[]>(apiEndpoints.products)) ?? []
  ).map(mapLaravelProductToProduct);

  return products.filter((product) => {
    if (filters.category && categorySlug(product.category) !== filters.category) {
      return false;
    }
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
