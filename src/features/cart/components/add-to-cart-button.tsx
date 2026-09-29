"use client";

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
  const isDisabled = disabled || !variant;

  function handleClick() {
    if (!variant) {
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
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleClick}
      disabled={isDisabled}
    >
      Ajouter au panier
    </Button>
  );
}
