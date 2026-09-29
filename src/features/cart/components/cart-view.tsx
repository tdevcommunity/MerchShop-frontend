"use client";

import { CartItemRow } from "@/features/cart/components/cart-item";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { EmptyCart } from "@/features/cart/components/empty-cart";
import { useCart } from "@/features/cart/hooks/use-cart";

export function CartView() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-label="Articles du panier">
        {cart.items.map((item) => (
          <CartItemRow
            key={`${item.productId}-${item.variantId}`}
            item={item}
          />
        ))}
      </section>
      <CartSummary cart={cart} />
    </div>
  );
}
