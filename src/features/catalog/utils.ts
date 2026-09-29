import type { Product, ProductBadge, ProductCategory } from "@/types/catalog";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  textile: "Vêtements",
  accessories: "Accessoires",
  bagagerie: "Bagagerie",
};

export const PRODUCT_BADGE_LABELS: Record<ProductBadge, string> = {
  bestseller: "Best-seller",
  new: "Nouveau",
  limited: "Limité",
};

export function productFromPrice(product: Product): number {
  const prices = product.variants.map((variant) => variant.unitPrice);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

export function colorSwatchClass(color: string): string {
  const map: Record<string, string> = {
    noir: "bg-tdev-black",
    jaune: "bg-tdev-yellow",
    anthracite: "bg-tdev-anthracite",
    cyan: "bg-tdev-cyan",
    bleu: "bg-tdev-blue",
    naturel: "bg-[#d6cbb8]",
    blanc: "bg-tdev-white",
    rose: "bg-tdev-pink",
    orange: "bg-tdev-orange",
    violet: "bg-tdev-violet",
    vert: "bg-tdev-green",
  };
  return map[color.toLowerCase()] ?? "bg-[#9a9a9a]";
}

export function countByCategory(
  products: Product[],
  category: ProductCategory,
): number {
  return products.filter((product) => product.category === category).length;
}
