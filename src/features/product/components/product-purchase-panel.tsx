"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { formatMoney } from "@/lib/utils/format-money";
import type { Product, ProductVariant } from "@/types/catalog";
import { Button } from "@/components/ui/button";

type ProductPurchasePanelProps = {
  product: Product;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");

  const selected = useMemo(
    () => product.variants.find((variant) => variant.id === variantId) ?? null,
    [product.variants, variantId],
  );

  function selectVariant(variant: ProductVariant) {
    setVariantId(variant.id);
    track(analyticsEvents.productVariantSelected, {
      productId: product.id,
      variantId: variant.id,
    });
  }

  const unavailable = !selected || selected.stockQuantity <= 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl text-tdev-white">{product.name}</h1>
        <p className="mt-2 text-white/70">{product.description}</p>
      </div>

      {selected ? (
        <p className="text-2xl font-medium text-tdev-yellow">
          {formatMoney(selected.unitPrice)}
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-tdev-white">
          Variante
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((variant) => {
            const label = [variant.color, variant.size].filter(Boolean).join(" · ");
            const isSelected = variant.id === variantId;
            return (
              <Button
                key={variant.id}
                variant={isSelected ? "primary" : "secondary"}
                size="sm"
                aria-pressed={isSelected}
                onClick={() => selectVariant(variant)}
                disabled={variant.stockQuantity <= 0}
              >
                {label || "Standard"}
              </Button>
            );
          })}
        </div>
      </fieldset>

      {unavailable ? (
        <p className="text-sm text-tdev-orange">Cette variante n&apos;est plus disponible.</p>
      ) : (
        <p className="text-xs text-white/50">
          Le stock affiché est indicatif. La disponibilité réelle est confirmée au checkout.
        </p>
      )}

      <AddToCartButton
        product={product}
        variant={selected}
        disabled={unavailable}
      />
    </div>
  );
}
