export const PRODUCT_CATEGORIES = [
  "textile",
  "accessories",
  "bagagerie",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const TEXTILE_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;

export type TextileSize = (typeof TEXTILE_SIZES)[number];

export type ProductVariant = {
  id: string;
  productId: string;
  size: TextileSize | null;
  color: string | null;
  sku: string;
  /** Stock serveur — le frontend ne doit pas en déduire une vente certaine. */
  stockQuantity: number;
  unitPrice: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  imageUrl: string | null;
  variants: ProductVariant[];
};

export type Category = {
  id: ProductCategory;
  label: string;
};

export type CatalogFilters = {
  category?: ProductCategory;
  query?: string;
};
