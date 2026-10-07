import type { ReactNode } from "react";
import { ProductImage } from "@/features/catalog/components/product-image";
import { lineSubtotal } from "@/features/cart/utils";
import { formatMoney } from "@/lib/utils/format-money";
import type { Cart } from "@/types/cart";

type CheckoutOrderSummaryProps = {
  cart: Cart;
  receptionNote?: string;
  receptionFree?: boolean;
  action?: ReactNode;
};

export function CheckoutOrderSummary({
  cart,
  receptionNote,
  receptionFree = false,
  action,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="border border-tdev-anthracite bg-tdev-white lg:border-tdev-anthracite lg:bg-tdev-anthracite lg:p-8 lg:shadow-[6px_6px_0_#155dfc]">
      <div className="flex items-center justify-between border-b border-tdev-anthracite px-4 py-3 lg:border-[#33383a] lg:px-0 lg:pb-4 lg:pt-0">
        <h2 className="font-headline text-lg font-extrabold uppercase lg:text-xl lg:tracking-[0.5px] lg:text-tdev-white">
          Récapitulatif ({cart.itemCount})
        </h2>
        <span className="hidden border border-[#33383a] bg-[#262c28] px-2.5 py-1 font-headline text-xs font-bold uppercase tracking-[0.6px] text-tdev-yellow lg:inline-flex">
          Drop 2026
        </span>
        <p className="text-xs font-medium text-tdev-muted lg:hidden">
          {cart.itemCount} article{cart.itemCount > 1 ? "s" : ""}
        </p>
      </div>
      <ul className="lg:mt-6 lg:flex lg:max-h-[260px] lg:flex-col lg:gap-3 lg:overflow-auto">
        {cart.items.map((item) => (
          <li
            key={`${item.productId}-${item.variantId}`}
            className="flex items-center justify-between gap-3 border-b border-tdev-border p-4 lg:border-[#2d3133] lg:px-0 lg:py-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="size-16 shrink-0 overflow-hidden border border-tdev-border bg-tdev-white lg:size-12 lg:border-0">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-full aspect-auto"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-headline text-sm font-bold leading-tight lg:font-sans lg:text-tdev-white">
                  {item.productName}
                </p>
                <p className="mt-1 text-xs text-tdev-muted lg:text-[#8a8f91]">
                  {item.variantLabel} · Qté {item.quantity}
                </p>
              </div>
            </div>
            <p className="shrink-0 font-headline text-sm font-bold lg:text-tdev-white">
              {formatMoney(lineSubtotal(item))}
            </p>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 px-4 py-3 lg:mt-2 lg:border-t lg:border-[#33383a] lg:px-0 lg:pt-4">
        <p className="flex items-center justify-between text-sm">
          <span className="text-tdev-muted lg:text-[#8a8f91]">Sous-total</span>
          <span className="font-headline font-bold lg:font-sans lg:text-tdev-white">
            {formatMoney(cart.subtotal)}
          </span>
        </p>
        {receptionNote ? (
          <p className="flex items-center justify-between text-sm">
            <span className="text-tdev-muted lg:text-[#8a8f91]">{receptionNote}</span>
            {receptionFree ? (
              <span className="text-xs font-bold uppercase text-tdev-green">
                Gratuit
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
      <div className="mx-4 mb-4 flex items-center justify-between bg-tdev-surface px-4 py-3 lg:mx-0 lg:mb-0 lg:border lg:border-[#33383a] lg:bg-[#24282a] lg:p-4">
        <span className="font-headline text-sm font-extrabold uppercase lg:text-tdev-white">
          Total à payer
        </span>
        <span className="font-headline text-xl font-extrabold lg:text-2xl lg:text-tdev-yellow">
          {formatMoney(cart.subtotal)}
        </span>
      </div>
      {action ? <div className="hidden lg:mt-6 lg:block">{action}</div> : null}
    </aside>
  );
}
