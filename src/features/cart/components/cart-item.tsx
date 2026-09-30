"use client";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { TrashIcon } from "@/components/ui/icons";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { ProductImage } from "@/features/catalog/components/product-image";
import { useCartActions } from "@/features/cart/hooks/use-cart";
import { lineSubtotal } from "@/features/cart/utils";
import { formatMoney } from "@/lib/utils/format-money";
import type { CartItem } from "@/types/cart";

type CartItemRowProps = {
  item: CartItem;
};

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartActions();

  return (
    <article className="motion-enter flex flex-col gap-4 border border-tdev-anthracite bg-tdev-white p-4 sm:flex-row">
      <div className="size-28 shrink-0 overflow-hidden border border-tdev-border sm:size-32">
        <ProductImage
          src={item.imageUrl}
          alt={item.productName}
          className="h-full aspect-auto"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-headline text-lg font-bold">{item.productName}</h3>
            <p className="mt-1 text-sm text-tdev-muted">{item.variantLabel}</p>
            <p className="mt-1 text-sm">{formatMoney(item.unitPrice)}</p>
          </div>
          <p className="font-headline text-lg font-extrabold">
            {formatMoney(lineSubtotal(item))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper
            id={`qty-${item.variantId}`}
            value={item.quantity}
            onChange={(value) =>
              updateQuantity(item.productId, item.variantId, value)
            }
            label={`Quantité pour ${item.productName}`}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              removeItem(item.productId, item.variantId);
              track(analyticsEvents.removeFromCart, {
                productId: item.productId,
                variantId: item.variantId,
              });
            }}
          >
            <TrashIcon className="size-4" />
            Retirer
          </Button>
        </div>
      </div>
    </article>
  );
}
