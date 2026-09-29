"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { buttonClassName } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { CheckIcon } from "@/components/ui/icons";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import {
  customerFullName,
  deliveryLabel,
  formatShippingAddress,
  paymentLabel,
} from "@/features/checkout/utils";
import { TunnelHeader } from "@/features/order/components/tunnel-header";
import { useOrder } from "@/features/order/hooks/use-order";
import { formatMoney } from "@/lib/utils/format-money";

type OrderConfirmationProps = {
  orderId: string;
};

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const { order, error, notFound, isLoading } = useOrder(orderId);

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
    <div className="flex min-h-dvh flex-col bg-tdev-white lg:bg-tdev-surface">
      <div className="hidden lg:block">
        <TunnelHeader
          backHref="/"
          backLabel="Retour à la boutique"
          title="Confirmation"
          titleAs="p"
        />
      </div>

      <div className="bg-tdev-blue text-tdev-white">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-10 text-center lg:max-w-7xl lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-12 lg:py-12 lg:text-left">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-8">
            <span className="flex size-14 shrink-0 items-center justify-center bg-tdev-white text-tdev-blue lg:size-20">
              <CheckIcon className="size-8 lg:size-10" />
            </span>
            <div className="flex flex-col items-center gap-2 lg:items-start">
              <p className="text-[13px] font-bold uppercase tracking-[2.6px]">
                Commande confirmée
              </p>
              <h1 className="font-headline text-3xl font-extrabold uppercase lg:text-5xl">
                {order.reference}
              </h1>
              <p className="text-sm text-[#dbe6ff] lg:max-w-xl">
                Paiement mocké enregistré. Le statut réel restera celui du
                backend.
              </p>
            </div>
          </div>
          <dl className="hidden shrink-0 gap-10 lg:flex">
            <HeroStat label="Total" value={formatMoney(order.total)} />
            <HeroStat label="Statut" value="Payé" />
            <HeroStat
              label="Articles"
              value={`${itemCount} pièce${itemCount > 1 ? "s" : ""}`}
            />
          </dl>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-md flex-1 gap-5 px-5 py-6 lg:max-w-7xl lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-10 lg:px-12 lg:py-12">
        <section className="border border-tdev-anthracite bg-tdev-white">
          <p className="border-b border-tdev-border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-tdev-muted lg:px-8 lg:py-4">
            Détails de la commande
          </p>
          <dl className="grid gap-0 text-sm lg:grid-cols-2">
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

        <div className="flex flex-col gap-5 lg:sticky lg:top-8">
          <ul className="flex flex-col border border-tdev-anthracite bg-tdev-white">
            <li className="border-b border-tdev-border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-tdev-muted lg:px-6">
              Articles
            </li>
            {order.items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId}`}
                className="flex justify-between gap-3 border-b border-tdev-border px-4 py-4 text-sm last:border-b-0 lg:px-6"
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

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#dbe6ff]">
        {label}
      </dt>
      <dd className="mt-1 font-headline text-2xl font-extrabold">{value}</dd>
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
    <div className="flex justify-between gap-3 border-b border-tdev-border px-4 py-3.5 last:border-b-0 lg:px-8 lg:py-5">
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
