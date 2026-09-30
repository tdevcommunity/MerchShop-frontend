"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import {
  categoryLabel,
  PRODUCT_BADGE_LABELS,
  colorSwatchClass,
  colorSwatchStyle,
} from "@/features/catalog/utils";
import { formatMoney } from "@/lib/utils/format-money";
import { cn } from "@/lib/utils/cn";
import type { Product, ProductVariant, TextileSize } from "@/types/catalog";

type ProductPurchasePanelProps = {
  product: Product;
  color: string | null;
  onColorChange: (color: string) => void;
};

function uniqueValues<T extends string>(values: Array<T | null>): T[] {
  return [...new Set(values.filter((value): value is T => Boolean(value)))];
}

export function ProductPurchasePanel({
  product,
  color,
  onColorChange,
}: ProductPurchasePanelProps) {
  const colors = useMemo(
    () => uniqueValues(product.variants.map((variant) => variant.color)),
    [product.variants],
  );
  const allSizes = useMemo(
    () => uniqueValues(product.variants.map((variant) => variant.size)),
    [product.variants],
  );

  const firstAvailable = product.variants.find((variant) => variant.stockQuantity > 0);
  const [size, setSize] = useState<TextileSize | null>(
    firstAvailable?.size ?? allSizes[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);

  const sizesForColor = useMemo(() => {
    if (colors.length === 0) {
      return allSizes;
    }
    return uniqueValues(
      product.variants
        .filter((variant) => variant.color === color)
        .map((variant) => variant.size),
    );
  }, [allSizes, color, colors.length, product.variants]);

  const selected: ProductVariant | null = useMemo(() => {
    return (
      product.variants.find((variant) => {
        const colorOk = colors.length === 0 || variant.color === color;
        const sizeOk = allSizes.length === 0 || variant.size === size;
        return colorOk && sizeOk;
      }) ?? null
    );
  }, [allSizes.length, color, colors.length, product.variants, size]);

  function selectColor(nextColor: string) {
    onColorChange(nextColor);
    const nextSizes = uniqueValues(
      product.variants
        .filter((variant) => variant.color === nextColor)
        .map((variant) => variant.size),
    );
    const nextSize =
      size && nextSizes.includes(size) ? size : (nextSizes[0] ?? null);
    if (size !== nextSize) {
      setSize(nextSize);
    }
    const nextVariant = product.variants.find(
      (variant) =>
        variant.color === nextColor &&
        (nextSizes.length === 0 || variant.size === nextSize),
    );
    if (nextVariant) {
      track(analyticsEvents.productVariantSelected, {
        productId: product.id,
        variantId: nextVariant.id,
      });
    }
  }

  function selectSize(nextSize: TextileSize) {
    setSize(nextSize);
    const nextVariant = product.variants.find((variant) => {
      const colorOk = colors.length === 0 || variant.color === color;
      return colorOk && variant.size === nextSize;
    });
    if (nextVariant) {
      track(analyticsEvents.productVariantSelected, {
        productId: product.id,
        variantId: nextVariant.id,
      });
    }
  }

  const unavailable = !selected || selected.stockQuantity <= 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge>{product.categoryLabel ?? categoryLabel(product.category)}</Badge>
          {product.badge ? (
            <Badge tone={product.badge}>{PRODUCT_BADGE_LABELS[product.badge]}</Badge>
          ) : null}
        </div>
        <h1 className="font-headline text-3xl font-extrabold uppercase tracking-tight lg:text-5xl">
          {product.name}
        </h1>
        <p className="mt-3 text-tdev-subtle">{product.description}</p>
      </div>

      {selected ? (
        <p className="font-headline text-3xl font-extrabold">
          {formatMoney(selected.unitPrice)}
        </p>
      ) : null}

      {colors.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-[13px] font-bold uppercase tracking-[1.8px]">
            Couleur
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((item) => {
              const hex =
                product.variants.find((variant) => variant.color === item)?.colorHex ?? null;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={item === color}
                  aria-label={item}
                  onClick={() => selectColor(item)}
                  className={cn(
                    "size-11 border-2 transition-colors duration-150",
                    colorSwatchClass(item),
                    item === color ? "border-tdev-blue" : "border-tdev-anthracite",
                  )}
                  style={colorSwatchStyle(item, hex)}
                />
              );
            })}
          </div>
          {color ? (
            <p className="mt-2 text-sm text-tdev-muted">{color}</p>
          ) : null}
        </fieldset>
      ) : null}

      {allSizes.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-[13px] font-bold uppercase tracking-[1.8px]">
            Taille
          </legend>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((item) => {
              const available = sizesForColor.includes(item);
              const isSelected = item === size;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={!available}
                  onClick={() => selectSize(item)}
                  className={cn(
                    "min-h-11 min-w-11 border px-3 text-sm font-bold transition-colors duration-150",
                    isSelected
                      ? "border-tdev-anthracite bg-tdev-anthracite text-tdev-white"
                      : "border-tdev-anthracite bg-tdev-white",
                    !available && "cursor-not-allowed opacity-40",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div>
        <p className="mb-2 text-[13px] font-bold uppercase tracking-[1.8px]">
          Quantité
        </p>
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          label={`Quantité pour ${product.name}`}
        />
      </div>

      {unavailable ? (
        <p className="text-sm text-tdev-orange">
          Cette variante n&apos;est plus disponible.
        </p>
      ) : (
        <p className="text-xs text-tdev-muted">
          Stock indicatif
          {selected ? ` · ${selected.stockQuantity} pièce(s)` : ""}. La
          disponibilité réelle est confirmée au checkout.
        </p>
      )}

      <AddToCartButton
        product={product}
        variant={selected}
        quantity={quantity}
        disabled={unavailable}
      />
    </div>
  );
}
