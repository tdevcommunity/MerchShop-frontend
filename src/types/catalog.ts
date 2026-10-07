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
  /** Teinte libre (hex) si la couleur n'est pas dans la palette Shop. */
  colorHex?: string | null;
  /** Visuel de la couleur — partagé par toutes les tailles de cette teinte. */
  imageUrl?: string | null;
  sku: string;
  /** Stock serveur — le frontend ne doit pas en déduire une vente certaine. */
  stockQuantity: number;
  unitPrice: number;
};

export const PRODUCT_BADGES = ["bestseller", "new", "limited"] as const;

export type ProductBadge = (typeof PRODUCT_BADGES)[number];

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categoryLabel?: string;
  imageUrl: string | null;
  badge: ProductBadge | null;
  variants: ProductVariant[];
};

export type Category = {
  slug: string;
  label: string;
};

export type CatalogFilters = {
  category?: string;
  query?: string;
};
