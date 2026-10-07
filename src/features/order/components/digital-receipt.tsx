"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/shared/error-state";
import { DownloadIcon } from "@/components/ui/icons";
import { OfficialReceiptCard } from "@/features/order/components/official-receipt-card";
import { PostPurchaseHeader } from "@/features/order/components/post-purchase-header";
import { TunnelHeader } from "@/features/order/components/tunnel-header";
import { useOrder } from "@/features/order/hooks/use-order";
import { buttonClassName } from "@/components/ui/button";

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

  return (
    <div className="flex min-h-dvh flex-col bg-tdev-surface lg:bg-tdev-anthracite">
      <div className="lg:hidden">
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
      </div>
      <div className="hidden lg:block">
        <PostPurchaseHeader />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 py-6 lg:max-w-3xl lg:px-12 lg:py-12">
        <div className="hidden items-center justify-between gap-4 lg:flex">
          <div>
            <h1 className="font-headline text-xl font-extrabold uppercase tracking-[0.5px] text-tdev-white">
              Reçu officiel d&apos;achat
            </h1>
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
        <button
          type="button"
          className={`${buttonClassName("secondary", "lg")} lg:hidden`}
          disabled
        >
          Télécharger le PDF
        </button>
        <p className="text-center text-xs text-tdev-muted lg:text-left lg:text-[#8a8f91]">
          Le PDF officiel sera fourni par le backend.
        </p>
        <Link
          href={`/order/${order.id}/qr`}
          className={buttonClassName("brand", "lg")}
        >
          Voir le pass QR
        </Link>
      </div>
    </div>
  );
}
