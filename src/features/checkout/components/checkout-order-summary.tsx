import { ProductImage } from "@/features/catalog/components/product-image";
import { lineSubtotal } from "@/features/cart/utils";
import { formatMoney } from "@/lib/utils/format-money";
import type { Cart } from "@/types/cart";

type CheckoutOrderSummaryProps = {
  cart: Cart;
  receptionNote?: string;
};

export function CheckoutOrderSummary({
  cart,
  receptionNote,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="border border-tdev-anthracite bg-tdev-white">
      <div className="border-b border-tdev-anthracite px-4 py-3">
        <h2 className="font-headline text-lg font-extrabold uppercase">
          Ta commande
        </h2>
        <p className="text-xs font-medium text-tdev-muted">
          {cart.itemCount} article{cart.itemCount > 1 ? "s" : ""}
        </p>
      </div>
      <ul>
        {cart.items.map((item) => (
          <li
            key={`${item.productId}-${item.variantId}`}
            className="flex gap-3 border-b border-tdev-border p-4"
          >
            <div className="size-16 shrink-0 overflow-hidden border border-tdev-border">
              <ProductImage
                src={item.imageUrl}
                alt={item.productName}
                className="h-full aspect-auto"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-headline text-sm font-bold leading-tight">
                {item.productName}
              </p>
              <p className="mt-1 text-xs text-tdev-muted">
                {item.variantLabel} · ×{item.quantity}
              </p>
            </div>
            <p className="font-headline text-sm font-extrabold">
              {formatMoney(lineSubtotal(item))}
            </p>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-tdev-muted">Sous-total estimé</span>
        <span className="font-headline text-lg font-extrabold">
          {formatMoney(cart.subtotal)}
        </span>
      </div>
      {receptionNote ? (
        <p className="border-t border-tdev-border px-4 py-3 text-xs font-medium text-tdev-muted">
          {receptionNote}
        </p>
      ) : null}
    </aside>
  );
}
