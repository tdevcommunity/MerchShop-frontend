import type { Product } from "@/types/catalog";

export function matchesCatalogQuery(product: Product, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    product.name,
    product.description,
    product.slug,
    product.category,
    product.categoryLabel ?? "",
    ...product.variants.flatMap((variant) => [
      variant.sku,
      variant.color ?? "",
      variant.size ?? "",
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function filterProductsByQuery(products: Product[], rawQuery: string): Product[] {
  const query = rawQuery.trim();
  if (!query) {
    return products;
  }
  return products.filter((product) => matchesCatalogQuery(product, query));
}
