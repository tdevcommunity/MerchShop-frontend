"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { buttonClassName } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { CheckIcon, DownloadIcon } from "@/components/ui/icons";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import {
  customerFullName,
  deliveryLabel,
  formatShippingAddress,
  paymentLabel,
} from "@/features/checkout/utils";
import { MerchPassCard } from "@/features/order/components/merch-pass-card";
import { OfficialReceiptCard } from "@/features/order/components/official-receipt-card";
import { PostPurchaseHeader } from "@/features/order/components/post-purchase-header";
import { TunnelHeader } from "@/features/order/components/tunnel-header";
import { useOrder } from "@/features/order/hooks/use-order";
import { usePickupQr } from "@/features/order/hooks/use-pickup-qr";
import { formatMoney } from "@/lib/utils/format-money";

type OrderConfirmationProps = {
  orderId: string;
};

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const { order, error, notFound, isLoading } = useOrder(orderId);
  const { qr, qrError } = usePickupQr(orderId);

  useEffect(() => {
    if (order) {
      track(analyticsEvents.orderCompleted, { orderId: order.id });
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner label="Chargement de la commande" />
      </div>
    );
  }

  if (notFound) {
    return (
      <ErrorState
        title="Commande introuvable"
        description="Cette commande n'existe pas, a expiré, ou n'est pas accessible depuis ce navigateur."
      />
    );
  }

  if (error || !order) {
    return (
      <ErrorState
        title="Impossible de charger la commande"
        description={error ?? "Erreur inconnue."}
      />
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-dvh flex-col bg-tdev-white lg:bg-tdev-anthracite">
      <div className="lg:hidden">
        <TunnelHeader
          backHref="/"
          backLabel="Retour à la boutique"
          title="Confirmation"
          titleAs="p"
        />
      </div>
      <div className="hidden lg:block">
        <PostPurchaseHeader />
      </div>

      <div className="bg-tdev-blue text-tdev-white">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-10 text-center lg:max-w-[1280px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-12 lg:py-12 lg:text-left">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-8">
            <span className="motion-check flex size-14 shrink-0 items-center justify-center bg-tdev-white text-tdev-blue lg:size-20 lg:bg-tdev-yellow lg:text-tdev-anthracite lg:shadow-[4px_4px_0_#1b1d1c]">
              <CheckIcon className="size-8 lg:size-12" />
            </span>
            <div className="flex flex-col items-center gap-2 lg:items-start">
              <p className="motion-enter motion-delay-1 text-[13px] font-bold uppercase tracking-[2.6px] lg:hidden">
                Commande confirmée
              </p>
              <h1 className="motion-enter motion-delay-2 font-headline text-3xl font-extrabold uppercase lg:text-5xl lg:font-black lg:tracking-[-1.2px]">
                <span className="lg:hidden">{order.reference}</span>
                <span className="hidden lg:inline">Paiement réussi !</span>
              </h1>
              <p className="motion-enter motion-delay-3 text-sm text-[#dbe6ff] lg:max-w-xl lg:text-base lg:font-medium">
                Ta merch du TDEV Festival 2026 est officiellement réservée. On se
                voit au festival !
              </p>
            </div>
          </div>
          <div className="hidden border border-[#33383a] bg-tdev-anthracite p-4 lg:flex lg:flex-col lg:items-end lg:gap-1">
            <p className="text-xs uppercase tracking-[1.2px] text-[#8a8f91]">
              Commande référence
            </p>
            <h2 className="font-headline text-2xl font-extrabold text-tdev-yellow">
              {order.reference}
            </h2>
          </div>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-[1280px] grid-cols-12 gap-10 px-12 py-10 lg:grid">
        <section className="col-span-5 flex flex-col gap-6">
          <div>
            <h2 className="font-headline text-xl font-extrabold uppercase tracking-[0.5px] text-tdev-white">
              Ton pass de retrait
            </h2>
            <p className="text-xs text-[#8a8f91]">
              À présenter sur mobile ou imprimé au Stand Merch officiel.
            </p>
          </div>
          <MerchPassCard order={order} qr={qr} qrError={qrError} />
        </section>
        <section className="col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-headline text-xl font-extrabold uppercase tracking-[0.5px] text-tdev-white">
                Reçu officiel d&apos;achat
              </h2>
              <p className="text-xs text-[#8a8f91]">
                Preuve légale d&apos;acquisition des produits TDEV.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 bg-tdev-white px-4 py-2.5 font-headline text-xs font-extrabold uppercase text-tdev-anthracite"
            >
              <DownloadIcon className="size-4" />
              Télécharger le reçu PDF
            </button>
          </div>
          <OfficialReceiptCard order={order} />
        </section>
      </div>

      <div className="mx-auto grid w-full max-w-md flex-1 gap-5 px-5 py-6 lg:hidden">
        <section className="motion-enter motion-delay-4 border border-tdev-anthracite bg-tdev-white">
          <p className="border-b border-tdev-border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-tdev-muted">
            Détails de la commande
          </p>
          <dl className="grid gap-0 text-sm">
            <Row label="Statut" value="Payé" />
            <Row label="Total" value={formatMoney(order.total)} />
            <Row label="Réception" value={deliveryLabel(order.deliveryMethod)} />
            <Row label="Paiement" value={paymentLabel(order.paymentMethod)} />
            {order.shippingAddress ? (
              <Row
                label="Adresse"
                value={formatShippingAddress(order.shippingAddress)}
              />
            ) : null}
            {order.pickupLabel ? (
              <Row label="Lieu" value={order.pickupLabel} />
            ) : null}
            <Row
              label="Client"
              value={customerFullName(
                order.customer.firstName,
                order.customer.lastName,
              )}
            />
            <Row
              label="Date"
              value={new Date(order.createdAt).toLocaleString("fr-FR")}
              timeValue={order.createdAt}
            />
          </dl>
        </section>

        <div className="motion-enter motion-delay-5 flex flex-col gap-5">
          <ul className="flex flex-col border border-tdev-anthracite bg-tdev-white">
            <li className="border-b border-tdev-border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-tdev-muted">
              Articles
            </li>
            {order.items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId}`}
                className="flex justify-between gap-3 border-b border-tdev-border px-4 py-4 text-sm last:border-b-0"
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
          <p className="sr-only">{itemCount} articles</p>
          <Link
            href={`/order/${order.id}/qr`}
            className={buttonClassName("brand", "lg")}
          >
            Voir mon QR Code
          </Link>
          <Link
            href={`/order/${order.id}/receipt`}
            className={buttonClassName("secondary", "lg")}
          >
            Voir le reçu digital
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  timeValue,
}: {
  label: string;
  value: string;
  timeValue?: string;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-tdev-border px-4 py-3.5 last:border-b-0">
      <dt className="text-tdev-muted">{label}</dt>
      <dd className="text-right font-medium">
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
