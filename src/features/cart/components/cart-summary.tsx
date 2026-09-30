import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/format-money";
import type { Cart } from "@/types/cart";

type CartSummaryProps = {
  cart: Cart;
};

export function CartSummary({ cart }: CartSummaryProps) {
  return (
    <Card className="flex flex-col gap-4 lg:sticky lg:top-24">
      <h2 className="font-headline text-lg font-extrabold uppercase">
        Récapitulatif
      </h2>
      <p className="flex justify-between text-sm text-tdev-muted">
        <span>Articles</span>
        <span>{cart.itemCount}</span>
      </p>
      <p className="flex justify-between border-t border-tdev-border pt-3 text-base font-medium">
        <span>Sous-total estimé</span>
        <span
          key={cart.subtotal}
          className="motion-pop inline-block font-headline text-xl font-extrabold"
        >
          {formatMoney(cart.subtotal)}
        </span>
      </p>
      <p className="text-xs text-tdev-muted">
        Prix, stock et total seront confirmés par le serveur au paiement.
      </p>
      <Link href="/checkout" className={buttonClassName("brand", "lg")}>
        Continuer
      </Link>
      <Link href="/shop" className={buttonClassName("secondary", "md")}>
        Continuer les achats
      </Link>
    </Card>
  );
}
