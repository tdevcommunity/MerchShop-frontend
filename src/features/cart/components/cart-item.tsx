"use client";

import { Button } from "@/components/ui/button";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
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
    <article className="flex gap-4 border-b border-white/10 py-4">
      <div
        className="size-20 shrink-0 rounded-md bg-white/10"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium text-tdev-white">{item.productName}</h3>
            <p className="text-sm text-white/60">{item.variantLabel}</p>
          </div>
          <p className="text-sm font-medium text-tdev-yellow">
            {formatMoney(lineSubtotal(item))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`qty-${item.variantId}`}>
            Quantité pour {item.productName}
          </label>
          <input
            id={`qty-${item.variantId}`}
            type="number"
            min={1}
            max={10}
            value={item.quantity}
            onChange={(event) =>
              updateQuantity(
                item.productId,
                item.variantId,
                Number(event.target.value),
              )
            }
            className="min-h-11 w-16 rounded-md border border-white/15 bg-tdev-anthracite px-2 text-tdev-white"
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
            Retirer
          </Button>
        </div>
      </div>
    </article>
  );
}
