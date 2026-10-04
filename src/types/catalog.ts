export const PRODUCT_CATEGORIES = [
  "textile",
  "accessories",
  "bagagerie",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const TEXTILE_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;
export type TextileSize = (typeof TEXTILE_SIZES)[number];

export type ProductVariant = {
  uuid: string;
  sku: string;
  name: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  status: number;
  isAvailable: boolean;
};

export type Product = {
  uuid: string;
  slug: string;
  name: string;
  description: string;
  category: {
    uuid: string;
    name: string;
    slug: string;
  } | null;
  imageUrl: string | null;
  status: number;
  variants: ProductVariant[];
  variantsCount: number;
  priceFrom: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  status: number;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CatalogFilters = {
  category?: string;
  query?: string;
};
