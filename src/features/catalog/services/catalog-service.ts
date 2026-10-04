import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import { categorySlug } from "@/features/catalog/utils";
import type { CatalogFilters, Category, Product } from "@/types/catalog";

export async function listShopCategories(): Promise<Category[]> {
  return apiRequest<Category[]>(apiEndpoints.categories);
}

export async function listProducts(
  filters: CatalogFilters = {},
): Promise<Product[]> {
  const products = await apiRequest<Product[]>(apiEndpoints.products);

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
  const product = await apiRequest<Product>(apiEndpoints.productBySlug(slug));

  if (!product) {
    throw new NotFoundError("Ce produit est introuvable.");
  }

  return product;
}
