"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/shared/error-state";
import { DownloadIcon } from "@/components/ui/icons";
import { useOrder } from "@/features/order/hooks/use-order";
import { TunnelHeader } from "@/features/order/components/tunnel-header";
import {
  customerFullName,
  deliveryLabel,
  formatShippingAddress,
  paymentLabel,
} from "@/features/checkout/utils";
import { formatMoney } from "@/lib/utils/format-money";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type DigitalReceiptProps = {
  orderId: string;
};

export function DigitalReceipt({ orderId }: DigitalReceiptProps) {
  const { order, error, notFound, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-tdev-surface">
        <Spinner label="Chargement du reçu" />
      </div>
    );
  }

  if (notFound || error || !order) {
    return (
      <div className="px-5 py-10">
        <ErrorState
          title="Reçu introuvable"
          description={
            error ??
            "Cette commande n'existe pas ou n'est plus accessible depuis ce navigateur."
          }
        />
      </div>
    );
  }

  const confirmationHref = `/checkout/confirmation?orderId=${encodeURIComponent(order.id)}`;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-dvh flex-col bg-tdev-surface">
      <TunnelHeader
        backHref={confirmationHref}
        backLabel="Retour à la confirmation"
        title="Reçu digital"
        trailing={
          <span
            className="flex size-9 items-center justify-center text-tdev-muted"
            aria-hidden="true"
          >
            <DownloadIcon className="size-[18px]" />
          </span>
        }
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 py-6 lg:max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10 lg:px-12 lg:py-12">
        <article className="border border-tdev-anthracite bg-tdev-white p-5 lg:p-0">
          <div className="flex items-start justify-between gap-3 border-b border-tdev-border pb-4 lg:px-10 lg:py-8 lg:pb-8">
            <div>
              <p className="font-headline text-lg font-extrabold lg:text-3xl">
                TDEV/SHOP
              </p>
              <p className="text-xs text-tdev-muted lg:mt-1 lg:text-sm">
                Reçu {order.reference}
              </p>
            </div>
            <span className="bg-tdev-green px-2 py-1 text-[11px] font-extrabold uppercase">
              Payé
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm lg:mt-0 lg:grid-cols-3 lg:gap-0 lg:border-b lg:border-tdev-border">
            <Meta
              label="Date"
              value={new Date(order.createdAt).toLocaleString("fr-FR")}
              timeValue={order.createdAt}
            />
            <Meta
              label="Client"
              value={customerFullName(
                order.customer.firstName,
                order.customer.lastName,
              )}
            />
            {order.customer.email ? (
              <Meta label="Email" value={order.customer.email} />
            ) : (
              <Meta
                label="Paiement"
                value={paymentLabel(order.paymentMethod)}
                last
              />
            )}
            {order.customer.phone ? (
              <Meta
                label="Téléphone"
                value={order.customer.phone}
                className="lg:hidden"
              />
            ) : null}
            {order.shippingAddress ? (
              <Meta
                label="Livraison"
                value={formatShippingAddress(order.shippingAddress)}
                className="lg:hidden"
              />
            ) : null}
          </dl>

          <ul className="mt-5 flex flex-col gap-3 border-t border-tdev-border pt-4 lg:hidden">
            {order.items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId}`}
                className="flex justify-between gap-3 text-sm"
              >
                <span>
                  {item.quantity} × {item.productName}
                  <span className="block text-xs text-tdev-muted">
                    {item.variantLabel}
                  </span>
                </span>
                <span className="font-headline font-bold">
                  {formatMoney(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-tdev-border text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
                  <th className="px-10 py-4 font-bold">Qté</th>
                  <th className="px-4 py-4 font-bold">Article</th>
                  <th className="px-4 py-4 font-bold">Variante</th>
                  <th className="px-10 py-4 text-right font-bold">Montant</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={`${item.productId}-${item.variantId}`}
                    className="border-b border-tdev-border"
                  >
                    <td className="px-10 py-5 font-headline font-extrabold">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-5">{item.productName}</td>
                    <td className="px-4 py-5 text-tdev-muted">
                      {item.variantLabel}
                    </td>
                    <td className="px-10 py-5 text-right font-headline font-bold">
                      {formatMoney(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 lg:grid lg:grid-cols-2 lg:gap-0 lg:border-t-0">
            <dl className="hidden flex-col justify-center gap-3 border-r border-tdev-border px-10 py-8 text-sm lg:flex">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
                  Paiement
                </dt>
                <dd className="mt-1 font-medium">
                  {paymentLabel(order.paymentMethod)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
                  Réception
                </dt>
                <dd className="mt-1 font-medium">
                  {deliveryLabel(order.deliveryMethod)}
                  {order.pickupLabel ? ` · ${order.pickupLabel}` : ""}
                </dd>
              </div>
              {order.shippingAddress ? (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
                    Adresse
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatShippingAddress(order.shippingAddress)}
                  </dd>
                </div>
              ) : null}
              {order.customer.phone ? (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
                    Téléphone
                  </dt>
                  <dd className="mt-1 font-medium">{order.customer.phone}</dd>
                </div>
              ) : null}
            </dl>

            <div className="lg:px-10 lg:py-8">
              <div className="flex justify-between border-t border-tdev-border pt-4 lg:border-t-0 lg:pt-0">
                <span className="text-sm text-tdev-muted">
                  Sous-total · {itemCount} article{itemCount > 1 ? "s" : ""}
                </span>
                <span className="font-headline font-bold">
                  {formatMoney(order.total)}
                </span>
              </div>
              <div className="mt-2 bg-tdev-blue px-3 py-3 text-tdev-white lg:mt-4 lg:px-5 lg:py-4">
                <p className="flex justify-between font-headline text-lg font-extrabold lg:text-2xl">
                  <span>Total</span>
                  <span>{formatMoney(order.total)}</span>
                </p>
              </div>
              <dl className="mt-4 flex flex-col gap-2 text-sm lg:hidden">
                <div className="flex justify-between">
                  <dt className="text-tdev-muted">Paiement</dt>
                  <dd>{paymentLabel(order.paymentMethod)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-tdev-muted">Réception</dt>
                  <dd>{deliveryLabel(order.deliveryMethod)}</dd>
                </div>
                {order.pickupLabel ? (
                  <div className="flex justify-between">
                    <dt className="text-tdev-muted">Lieu</dt>
                    <dd className="text-right">{order.pickupLabel}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </article>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-8">
          <button
            type="button"
            className={buttonClassName("secondary", "lg")}
            disabled
          >
            Télécharger le PDF
          </button>
          <p className="text-center text-xs text-tdev-muted lg:text-left">
            Le PDF officiel sera fourni par le backend.
          </p>
          <Link
            href={`/order/${order.id}/qr`}
            className={`${buttonClassName("brand", "lg")} hidden lg:inline-flex`}
          >
            Voir le pass QR
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Meta({
  label,
  value,
  timeValue,
  last = false,
  className,
}: {
  label: string;
  value: string;
  timeValue?: string;
  last?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-3 lg:flex-col lg:justify-center lg:gap-1 lg:px-10 lg:py-6",
        last ? "" : "lg:border-r lg:border-tdev-border",
        className,
      )}
    >
      <dt className="text-tdev-muted lg:text-[11px] lg:font-bold lg:uppercase lg:tracking-[0.16em]">
        {label}
      </dt>
      <dd className="text-right font-medium lg:text-left">
        {timeValue ? (
          <time dateTime={timeValue} suppressHydrationWarning>
            {value}
          </time>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
