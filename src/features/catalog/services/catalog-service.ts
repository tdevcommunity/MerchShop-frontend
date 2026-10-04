import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import { categorySlug } from "@/features/catalog/utils";
import type { CatalogFilters, Category, Product } from "@/types/catalog";
import {
  findPublishedProduct,
  listPublicCategories,
  listPublishedProducts,
} from "@/server/shop-store";

const useTestMock = process.env.VITEST === "true";

export async function listShopCategories(): Promise<Category[]> {
  if (useTestMock) {
    return listPublicCategories();
  }
  return apiRequest<Category[]>(apiEndpoints.categories);
}

export async function listProducts(
  filters: CatalogFilters = {},
): Promise<Product[]> {
  const products = useTestMock
    ? listPublishedProducts()
    : await apiRequest<Product[]>(apiEndpoints.products);

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
  if (useTestMock) {
    const product = findPublishedProduct(slug);
    if (!product) {
      throw new NotFoundError("Ce produit est introuvable.");
    }
    return product;
  }
  const product = await apiRequest<Product>(apiEndpoints.productBySlug(slug));
  if (!product) {
    throw new NotFoundError("Ce produit est introuvable.");
  }
  return product;
}

export async function getProductById(uuid: string): Promise<Product> {
  if (useTestMock) {
    const product = listPublishedProducts().find((item) => item.id === uuid);
    if (!product) {
      throw new NotFoundError("Ce produit est introuvable.");
    }
    return product;
  }
  const product = await apiRequest<Product>(apiEndpoints.productByUuid(uuid));
  if (!product) {
    throw new NotFoundError("Ce produit est introuvable.");
  }
  return product;
}
