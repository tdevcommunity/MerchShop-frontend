"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { useCartActions } from "@/features/cart/hooks/use-cart";
import { variantLabel } from "@/features/cart/utils";
import type { Product, ProductVariant } from "@/types/catalog";

type AddToCartButtonProps = {
  product: Product;
  variant: ProductVariant | null;
  quantity?: number;
  disabled?: boolean;
};

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  disabled,
}: AddToCartButtonProps) {
  const { addItem } = useCartActions();
  const [added, setAdded] = useState(false);
  const isDisabled = disabled || !variant;

  function handleClick() {
    if (!variant || added) {
      return;
    }
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantLabel: variantLabel(variant.size, variant.color),
      size: variant.size,
      color: variant.color,
      unitPrice: variant.unitPrice,
      imageUrl: product.imageUrl,
      quantity,
    });
    track(analyticsEvents.addToCart, {
      productId: product.id,
      variantId: variant.id,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleClick}
      disabled={isDisabled}
      aria-live="polite"
    >
      {added ? "Ajouté ✓" : "Ajouter au panier"}
    </Button>
  );
}
