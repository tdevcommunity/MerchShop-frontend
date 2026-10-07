"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/shared/error-state";
import { buttonClassName } from "@/components/ui/button";
import { MerchPassCard } from "@/features/order/components/merch-pass-card";
import { PostPurchaseHeader } from "@/features/order/components/post-purchase-header";
import { TunnelHeader } from "@/features/order/components/tunnel-header";
import { useOrder } from "@/features/order/hooks/use-order";
import { usePickupQr } from "@/features/order/hooks/use-pickup-qr";

type DigitalQrPassProps = {
  orderId: string;
};

export function DigitalQrPass({ orderId }: DigitalQrPassProps) {
  const { order, error, notFound, isLoading } = useOrder(orderId);
  const { qr, qrError } = usePickupQr(orderId);

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

  const confirmationHref = `/checkout/confirmation?orderId=${encodeURIComponent(order.id)}`;

  return (
    <div className="flex min-h-dvh flex-col bg-tdev-anthracite text-tdev-white">
      <div className="lg:hidden">
        <TunnelHeader
          backHref={confirmationHref}
          backLabel="Retour à la confirmation"
          title="Merch Pass"
          inverted
        />
      </div>
      <div className="hidden lg:block">
        <PostPurchaseHeader />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 py-6 lg:max-w-xl lg:px-12 lg:py-12">
        <div className="hidden lg:block">
          <h1 className="font-headline text-xl font-extrabold uppercase tracking-[0.5px]">
            Ton pass de retrait
          </h1>
          <p className="text-xs text-[#8a8f91]">
            À présenter sur mobile ou imprimé au Stand Merch officiel.
          </p>
        </div>
        <MerchPassCard order={order} qr={qr} qrError={qrError} />
        <p className="text-xs text-[#9a9a9a] lg:text-sm">
          L&apos;affichage n&apos;est pas une preuve de validité. Le scan
          Chantier 3B valide le pass côté serveur.
        </p>
        <Link
          href={`/order/${order.id}/receipt`}
          className={buttonClassName("primary", "lg")}
        >
          Voir le reçu détaillé
        </Link>
      </div>
    </div>
  );
}
