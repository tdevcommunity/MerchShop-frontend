"use client";

import { useMemo, useState } from "react";
import { ProductGallery } from "@/features/product/components/product-gallery";
import { ProductPurchasePanel } from "@/features/product/components/product-purchase-panel";
import { productImageForColor } from "@/features/catalog/utils";
import type { Product } from "@/types/catalog";

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const colors = useMemo(
    () =>
      [...new Set(product.variants.map((variant) => variant.color).filter(Boolean))] as string[],
    [product.variants],
  );
  const firstAvailable = product.variants.find((variant) => variant.stockQuantity > 0);
  const [color, setColor] = useState<string | null>(
    firstAvailable?.color ?? colors[0] ?? null,
  );

  return (
    <>
      <ProductGallery
        name={product.name}
        imageUrl={productImageForColor(product, color)}
      />
      <ProductPurchasePanel
        product={product}
        color={color}
        onColorChange={setColor}
      />
    </>
  );
}
