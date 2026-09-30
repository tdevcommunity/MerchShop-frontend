import {
  customerFullName,
  deliveryLabel,
  formatShippingAddress,
  paymentLabel,
} from "@/features/checkout/utils";
import { formatMoney } from "@/lib/utils/format-money";
import { DELIVERY_METHODS } from "@/types/delivery";
import type { Order } from "@/types/order";

type OfficialReceiptCardProps = {
  order: Order;
};

export function OfficialReceiptCard({ order }: OfficialReceiptCardProps) {
  const name = customerFullName(
    order.customer.firstName,
    order.customer.lastName,
  );
  const paidBy =
    order.paymentMethod === "mobile_money"
      ? "Payé par Mobile Money"
      : order.paymentMethod === "card"
        ? "Payé par carte"
        : "Payé";
  const recoveryTitle =
    order.deliveryMethod === DELIVERY_METHODS.PICKUP_EVENT
      ? "Stand Merch"
      : deliveryLabel(order.deliveryMethod);
  const recoveryDetail =
    order.deliveryMethod === DELIVERY_METHODS.PICKUP_EVENT
      ? "Village Festival TDEV"
      : order.shippingAddress
        ? formatShippingAddress(order.shippingAddress)
        : "Adresse à confirmer";

  return (
    <article className="flex flex-col gap-6 border border-[#33383a] bg-tdev-white p-5 text-tdev-anthracite shadow-[8px_8px_0_#155dfc] lg:p-8">
      <div className="flex items-start justify-between gap-4 border-b border-tdev-anthracite pb-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center bg-tdev-blue font-headline text-2xl font-black text-tdev-white">
            T
          </span>
          <div>
            <p className="font-headline text-xl font-extrabold tracking-[-0.5px]">
              TDEV/SHOP
            </p>
            <p className="text-xs text-tdev-muted">
              Boutique Officielle du Festival 2026
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-tdev-green px-3 py-[3px] font-headline text-xs font-bold uppercase tracking-[0.6px] text-tdev-white">
            {paidBy}
          </span>
          <time
            dateTime={order.createdAt}
            className="text-xs text-tdev-muted"
            suppressHydrationWarning
          >
            Date : {new Date(order.createdAt).toLocaleString("fr-FR")}
          </time>
        </div>
      </div>

      <div className="grid gap-4 border border-tdev-border bg-[#f8f9fa] p-4 sm:grid-cols-3">
        <ReceiptMeta
          label="Client"
          value={name || "Invité"}
          detail={order.customer.email || order.customer.phone || undefined}
        />
        <ReceiptMeta
          label="Moyen de paiement"
          value={
            order.paymentMethod === "mobile_money"
              ? "Mixx By Yas"
              : paymentLabel(order.paymentMethod)
          }
          detail={
            order.customer.phone
              ? `Compte : ${maskPhone(order.customer.phone)}`
              : undefined
          }
        />
        <ReceiptMeta
          label="Récupération"
          value={recoveryTitle}
          detail={recoveryDetail}
        />
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-tdev-anthracite font-headline text-xs font-extrabold uppercase text-[#8a8f91]">
            <th className="py-3 font-extrabold">Article & spécifications</th>
            <th className="py-3 text-center font-extrabold">Qté</th>
            <th className="hidden py-3 text-right font-extrabold sm:table-cell">
              Prix unitaire
            </th>
            <th className="py-3 text-right font-extrabold">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr
              key={`${item.productId}-${item.variantId}`}
              className="border-t border-[#eeeeec] first:border-t-0"
            >
              <td className="py-4">
                <p className="text-sm font-bold">{item.productName}</p>
                <p className="text-xs text-tdev-muted">{item.variantLabel}</p>
              </td>
              <td className="py-4 text-center font-headline text-sm font-bold">
                {item.quantity}
              </td>
              <td className="hidden py-4 text-right font-headline text-sm font-bold sm:table-cell">
                {formatMoney(item.unitPrice)}
              </td>
              <td className="py-4 text-right font-headline text-sm font-extrabold">
                {formatMoney(item.unitPrice * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-full max-w-[288px] border-t border-tdev-anthracite pt-4">
        <p className="flex justify-between text-sm">
          <span className="text-tdev-muted">Sous-total HT</span>
          <span className="font-headline font-bold">
            {formatMoney(order.total)}
          </span>
        </p>
        <p className="mt-2 flex justify-between text-sm">
          <span className="text-tdev-muted">
            {order.deliveryMethod === DELIVERY_METHODS.PICKUP_EVENT
              ? "Frais de retrait"
              : "Livraison"}
          </span>
          <span className="font-headline text-xs font-bold uppercase text-tdev-green">
            {order.deliveryMethod === DELIVERY_METHODS.PICKUP_EVENT
              ? "Gratuit"
              : "Selon zone"}
          </span>
        </p>
        <div className="mt-4 flex items-center justify-between bg-tdev-blue p-3.5 text-tdev-white">
          <span className="font-headline text-sm font-extrabold uppercase">
            Total payé TTC
          </span>
          <span className="font-headline text-xl font-extrabold text-tdev-yellow">
            {formatMoney(order.total)}
          </span>
        </div>
      </div>

      <p className="border-t border-tdev-border pt-4 text-center text-[11px] text-[#8a8f91]">
        Ce reçu électronique fait office de facture et justificatif d&apos;achat
        officiel pour le TDEV Festival 2026.
      </p>
    </article>
  );
}

function ReceiptMeta({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div>
      <p className="pb-[3px] text-xs font-bold uppercase tracking-[0.6px] text-[#8a8f91]">
        {label}
      </p>
      <p className="font-headline text-sm font-bold">{value}</p>
      {detail ? <p className="text-xs text-tdev-muted">{detail}</p> : null}
    </div>
  );
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 3) {
    return "****";
  }
  return `**** ${digits.slice(-3)}`;
}
