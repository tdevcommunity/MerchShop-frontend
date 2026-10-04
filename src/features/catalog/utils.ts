import type { Category, Product, ProductBadge, ProductCategory } from "@/types/catalog";

export function categorySlug(category: Product["category"] | null | undefined): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return "";
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  textile: "Vêtements",
  accessories: "Accessoires",
  bagagerie: "Bagagerie",
};

export function categoryLabel(
  category: Product["category"] | null | undefined,
  categories: Category[] = [],
): string {
  const slug = categorySlug(category);
  if (!slug) return "";
  return (
    categories.find((cat) => cat.slug === slug)?.label ??
    CATEGORY_LABELS[slug as ProductCategory] ??
    slug
  );
}

export const PRODUCT_BADGE_LABELS: Record<ProductBadge, string> = {
  bestseller: "Best-seller",
  new: "Nouveau",
  limited: "Limité",
};

export function productFromPrice(product: Product): number {
  const prices = product.variants.map((variant) => variant.unitPrice);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

const COLOR_SWATCHES: Record<string, string> = {
  noir: "bg-tdev-black",
  blanc: "bg-tdev-white",
  bleu: "bg-tdev-blue",
  jaune: "bg-tdev-yellow",
  anthracite: "bg-tdev-anthracite",
  cyan: "bg-tdev-cyan",
  naturel: "bg-[#d6cbb8]",
  rose: "bg-tdev-pink",
  orange: "bg-tdev-orange",
  violet: "bg-tdev-violet",
  vert: "bg-tdev-green",
};

export const PRODUCT_COLOR_OPTIONS = [
  "Noir",
  "Blanc",
  "Bleu",
  "Jaune",
  "Anthracite",
  "Cyan",
  "Naturel",
  "Rose",
  "Orange",
  "Violet",
  "Vert",
] as const;

export function isPaletteColor(color: string): boolean {
  return PRODUCT_COLOR_OPTIONS.some(
    (option) => option.toLowerCase() === color.trim().toLowerCase(),
  );
}

export function colorSwatchClass(color: string): string {
  return COLOR_SWATCHES[color.toLowerCase()] ?? "";
}

export function colorSwatchStyle(
  color: string,
  hex?: string | null,
): { backgroundColor: string } | undefined {
  if (hex && /^#[0-9a-f]{6}$/i.test(hex)) {
    return { backgroundColor: hex };
  }
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return { backgroundColor: color };
  }
  if (!isPaletteColor(color)) {
    return { backgroundColor: "#9a9a9a" };
  }
  return undefined;
}

/** Image liée à une couleur, sinon image principale du produit. */
export function productImageForColor(
  product: Product,
  color: string | null | undefined,
): string | null {
  if (color) {
    const match = product.variants.find(
      (variant) => variant.color === color && variant.imageUrl,
    );
    if (match?.imageUrl) {
      return match.imageUrl;
    }
  }
  return product.imageUrl;
}

export function countByCategory(
  products: Product[],
  category: string,
): number {
  return products.filter((product) => categorySlug(product.category) === category).length;
}
