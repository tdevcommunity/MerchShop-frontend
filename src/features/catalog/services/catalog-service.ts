import { apiRequest } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { NotFoundError } from "@/lib/api/errors";
import { useMockApi } from "@/lib/config/env";
import type { CatalogFilters, Category, Product } from "@/types/catalog";
import { filterProductsByQuery } from "@/features/catalog/utils/search";
import {
  findPublishedProduct,
  listPublicCategories,
  listPublishedProducts,
} from "@/server/shop-store";
import type {
  LaravelCategory,
  LaravelPaginatedResponse,
  LaravelProduct,
  LaravelSingleResponse,
} from "@/lib/api/types";
import {
  mapLaravelCategoryToCategory,
  mapLaravelProductToProduct,
} from "@/lib/api/mappers";

export async function listShopCategories(): Promise<Category[]> {
  if (useMockApi) {
    return listPublicCategories();
  }

  const response = await apiRequest<
    LaravelSingleResponse<LaravelCategory[]> | LaravelCategory[]
  >(apiEndpoints.categories);

  const rawList = Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : [];

  return rawList.map(mapLaravelCategoryToCategory);
}

export async function listProducts(
  filters: CatalogFilters = {},
): Promise<Product[]> {
  let products: Product[];

  if (useMockApi) {
    products = listPublishedProducts();
  } else {
    const params = new URLSearchParams();
    if (filters.query?.trim()) {
      params.set("search", filters.query.trim());
    }
    params.set("per_page", "100");

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const response = await apiRequest<
      LaravelPaginatedResponse<LaravelProduct> | LaravelProduct[]
    >(`${apiEndpoints.products}${queryStr}`);

    const rawProducts = Array.isArray(response)
      ? response
      : Array.isArray(response.data)
        ? response.data
        : [];

    products = rawProducts.map(mapLaravelProductToProduct);
  }

  const byCategory = filters.category
    ? products.filter((product) => product.category === filters.category)
    : products;

  return filterProductsByQuery(byCategory, filters.query ?? "");
}

export async function getProductBySlug(slug: string): Promise<Product> {
  if (useMockApi) {
    const product = findPublishedProduct(slug);
    if (!product) {
      throw new NotFoundError("Ce produit est introuvable.");
    }
    return product;
  }

  const response = await apiRequest<
    LaravelSingleResponse<LaravelProduct> | LaravelProduct
  >(apiEndpoints.productBySlug(slug));

  const rawProduct =
    "data" in response && response.data ? response.data : (response as LaravelProduct);

  if (!rawProduct || !rawProduct.uuid) {
    throw new NotFoundError("Ce produit est introuvable.");
  }

  return mapLaravelProductToProduct(rawProduct);
}

export async function getProductById(uuid: string): Promise<Product> {
  if (useMockApi) {
    const all = listPublishedProducts();
    const found = all.find((p) => p.id === uuid);
    if (!found) {
      throw new NotFoundError("Ce produit est introuvable.");
    }
    return found;
  }

  const response = await apiRequest<
    LaravelSingleResponse<LaravelProduct> | LaravelProduct
  >(apiEndpoints.productById(uuid));

  const rawProduct =
    "data" in response && response.data ? response.data : (response as LaravelProduct);

  if (!rawProduct || !rawProduct.uuid) {
    throw new NotFoundError("Ce produit est introuvable.");
  }

  return mapLaravelProductToProduct(rawProduct);
}
