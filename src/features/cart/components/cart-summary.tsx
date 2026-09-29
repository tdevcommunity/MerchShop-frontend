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
    <Card className="flex flex-col gap-4">
      <h2 className="font-headline text-lg text-tdev-white">Récapitulatif</h2>
      <p className="flex justify-between text-sm text-white/70">
        <span>Articles</span>
        <span>{cart.itemCount}</span>
      </p>
      <p className="flex justify-between text-base font-medium text-tdev-white">
        <span>Sous-total estimé</span>
        <span>{formatMoney(cart.subtotal)}</span>
      </p>
      <p className="text-xs text-white/50">
        Prix, stock et total seront confirmés par le serveur au paiement.
      </p>
      <Link href="/checkout" className={buttonClassName("primary", "lg")}>
        Passer au checkout
      </Link>
    </Card>
  );
}
