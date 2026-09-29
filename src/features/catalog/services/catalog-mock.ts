import type { Product } from "@/types/catalog";

export const mockProducts: Product[] = [
  {
    id: "prod_tee_core",
    slug: "tshirt-tdev-core",
    name: "T-shirt TDEV Core",
    description:
      "T-shirt officiel du TDEV Festival 2026, coupe unisexe, coton lourd.",
    category: "textile",
    imageUrl: null,
    variants: [
      {
        id: "var_tee_m_black",
        productId: "prod_tee_core",
        size: "M",
        color: "Noir",
        sku: "TEE-CORE-M-BLK",
        stockQuantity: 24,
        unitPrice: 8000,
      },
      {
        id: "var_tee_l_black",
        productId: "prod_tee_core",
        size: "L",
        color: "Noir",
        sku: "TEE-CORE-L-BLK",
        stockQuantity: 12,
        unitPrice: 8000,
      },
      {
        id: "var_tee_xl_yellow",
        productId: "prod_tee_core",
        size: "XL",
        color: "Jaune",
        sku: "TEE-CORE-XL-YLW",
        stockQuantity: 6,
        unitPrice: 8000,
      },
    ],
  },
  {
    id: "prod_hoodie",
    slug: "hoodie-tdev-night",
    name: "Hoodie TDEV Night",
    description: "Sweat à capuche anthracite, sérigraphie festival au dos.",
    category: "textile",
    imageUrl: null,
    variants: [
      {
        id: "var_hood_l_anth",
        productId: "prod_hoodie",
        size: "L",
        color: "Anthracite",
        sku: "HOOD-NIGHT-L",
        stockQuantity: 8,
        unitPrice: 18000,
      },
    ],
  },
  {
    id: "prod_cap",
    slug: "casquette-tdev",
    name: "Casquette TDEV",
    description: "Casquette brodée, visière incurvée.",
    category: "textile",
    imageUrl: null,
    variants: [
      {
        id: "var_cap_std",
        productId: "prod_cap",
        size: null,
        color: "Noir",
        sku: "CAP-TDEV-BLK",
        stockQuantity: 40,
        unitPrice: 6000,
      },
    ],
  },
  {
    id: "prod_sticker",
    slug: "pack-stickers",
    name: "Pack stickers",
    description: "Huit stickers vinyle aux couleurs TDEV.",
    category: "accessories",
    imageUrl: null,
    variants: [
      {
        id: "var_sticker_pack",
        productId: "prod_sticker",
        size: null,
        color: null,
        sku: "STK-PACK",
        stockQuantity: 200,
        unitPrice: 2000,
      },
    ],
  },
  {
    id: "prod_bottle",
    slug: "bouteille-isotherme",
    name: "Bouteille isotherme",
    description: "Bouteille 500 ml, double paroi, logo TDEV.",
    category: "accessories",
    imageUrl: null,
    variants: [
      {
        id: "var_bottle_cyan",
        productId: "prod_bottle",
        size: null,
        color: "Cyan",
        sku: "BTL-CYAN",
        stockQuantity: 18,
        unitPrice: 9000,
      },
    ],
  },
  {
    id: "prod_tote",
    slug: "totebag-tdev",
    name: "Totebag TDEV",
    description: "Tote en coton canvas, impression sérigraphique.",
    category: "bagagerie",
    imageUrl: null,
    variants: [
      {
        id: "var_tote_nat",
        productId: "prod_tote",
        size: null,
        color: "Naturel",
        sku: "TOTE-NAT",
        stockQuantity: 30,
        unitPrice: 5000,
      },
    ],
  },
];

export function findMockProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((product) => product.slug === slug);
}
