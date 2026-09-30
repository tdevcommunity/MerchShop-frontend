import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import { useMockApi } from "@/lib/config/env";
import type { CatalogFilters, Product } from "@/types/catalog";
import {
  findPublishedProduct,
  listPublishedProducts,
} from "@/server/shop-store";

export async function listProducts(
  filters: CatalogFilters = {},
): Promise<Product[]> {
  const products = useMockApi
    ? listPublishedProducts()
    : await apiRequest<Product[]>(apiEndpoints.products);

  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) {
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
  const product = useMockApi
    ? findPublishedProduct(slug)
    : await apiRequest<Product>(apiEndpoints.productBySlug(slug));

  if (!product) {
    throw new NotFoundError("Ce produit est introuvable.");
  }

  return product;
}
