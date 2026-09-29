"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/shared/error-state";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { PickupQrCard } from "@/features/qr/components/pickup-qr-card";
import { getPickupQr } from "@/features/qr/services/qr-service";
import { TunnelHeader } from "@/features/order/components/tunnel-header";
import { useOrder } from "@/features/order/hooks/use-order";
import { customerFullName, deliveryLabel } from "@/features/checkout/utils";
import { buttonClassName } from "@/components/ui/button";
import type { PickupQr } from "@/types/qr";
import { toUserMessage } from "@/lib/api/errors";

type DigitalQrPassProps = {
  orderId: string;
};

export function DigitalQrPass({ orderId }: DigitalQrPassProps) {
  const { order, error, notFound, isLoading } = useOrder(orderId);
  const [qr, setQr] = useState<PickupQr | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadQr() {
      try {
        const nextQr = await getPickupQr(orderId);
        if (!cancelled) {
          setQr(nextQr);
          track(analyticsEvents.qrDisplayed, { orderId });
        }
      } catch (loadError) {
        if (!cancelled) {
          setQrError(toUserMessage(loadError));
        }
      }
    }
    void loadQr();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-tdev-anthracite">
        <Spinner label="Chargement du pass" />
      </div>
    );
  }

  if (notFound || error || !order) {
    return (
      <div className="px-5 py-10">
        <ErrorState
          title="Pass introuvable"
          description={
            error ??
            "Cette commande n'existe pas ou n'est plus accessible depuis ce navigateur."
          }
        />
      </div>
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const confirmationHref = `/checkout/confirmation?orderId=${encodeURIComponent(order.id)}`;

  return (
    <div className="flex min-h-dvh flex-col bg-tdev-anthracite text-tdev-white">
      <TunnelHeader
        backHref={confirmationHref}
        backLabel="Retour à la confirmation"
        title="Merch Pass"
        inverted
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 py-6 lg:max-w-7xl lg:flex-row lg:items-stretch lg:gap-10 lg:px-12 lg:py-12">
        <article className="flex flex-1 flex-col border border-white/15 bg-[#24282a] lg:flex-row">
          <div className="flex flex-col p-5 lg:w-[22rem] lg:shrink-0 lg:border-r lg:border-dashed lg:border-white/20 lg:p-8">
            <p className="text-[13px] font-bold uppercase tracking-[2.6px] text-tdev-yellow">
              TDEV Festival 2026
            </p>
            <h2 className="mt-2 font-headline text-2xl font-extrabold lg:text-3xl">
              {order.reference}
            </h2>
            <p className="mt-1 text-sm text-[#b5b5b5]">Prêt pour retrait</p>
            <div className="mt-5 flex flex-1 items-center justify-center">
              {qrError ? (
                <p className="text-sm text-tdev-orange">{qrError}</p>
              ) : qr ? (
                <PickupQrCard qr={qr} compact />
              ) : (
                <Spinner label="Chargement du QR" />
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between gap-6 border-t border-white/10 p-5 lg:border-t-0 lg:p-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a8f91]">
                Titulaire
              </p>
              <p className="mt-2 font-headline text-2xl font-extrabold lg:text-4xl">
                {customerFullName(
                  order.customer.firstName,
                  order.customer.lastName,
                )}
              </p>
              <dl className="mt-8 grid grid-cols-2 gap-6 text-xs uppercase tracking-[0.3px] text-[#8a8f91]">
                <div>
                  <dt>Réception</dt>
                  <dd className="mt-1 text-sm font-bold normal-case tracking-normal text-tdev-white">
                    {deliveryLabel(order.deliveryMethod)}
                  </dd>
                </div>
                <div>
                  <dt>Articles</dt>
                  <dd className="mt-1 text-sm font-bold normal-case tracking-normal text-tdev-white">
                    {itemCount}
                  </dd>
                </div>
                {order.pickupLabel ? (
                  <div className="col-span-2">
                    <dt>Lieu</dt>
                    <dd className="mt-1 text-sm font-bold normal-case tracking-normal text-tdev-white">
                      {order.pickupLabel}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <ul className="hidden border-t border-white/10 pt-6 text-sm text-[#c5c5c5] lg:block">
              {order.items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex justify-between gap-3 py-1.5"
                >
                  <span>
                    {item.quantity} × {item.productName}
                  </span>
                  <span className="text-[#8a8f91]">{item.variantLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <aside className="flex flex-col gap-5 lg:w-80 lg:shrink-0 lg:justify-between lg:py-2">
          <p className="text-xs text-[#9a9a9a] lg:text-sm lg:leading-relaxed">
            L&apos;affichage n&apos;est pas une preuve de validité. Le scan
            Chantier 3B valide le pass côté serveur.
          </p>
          <Link
            href={`/order/${order.id}/receipt`}
            className={buttonClassName("primary", "lg")}
          >
            Voir le reçu détaillé
          </Link>
        </aside>
      </div>
    </div>
  );
}
