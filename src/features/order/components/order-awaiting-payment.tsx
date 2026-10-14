import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { buttonClassName } from "@/components/ui/button";
import type { Order } from "@/types/order";

type OrderAwaitingPaymentProps = {
  order: Order;
};

export function OrderAwaitingPayment({ order }: OrderAwaitingPaymentProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-12">
      <Alert title="Paiement non confirmé" tone="info">
        La commande <strong>{order.reference}</strong> est enregistrée, mais
        aucun règlement n&apos;a été confirmé par l&apos;opérateur. Tant que le
        paiement n&apos;est pas validé, ta merch n&apos;est pas réservée pour
        retrait.
      </Alert>
      <Link
        href={`/checkout/processing?orderId=${encodeURIComponent(order.id)}`}
        className={buttonClassName("primary", "lg")}
      >
        Reprendre le paiement
      </Link>
      <Link href="/shop" className={buttonClassName("secondary", "lg")}>
        Retourner à la boutique
      </Link>
    </div>
  );
}
