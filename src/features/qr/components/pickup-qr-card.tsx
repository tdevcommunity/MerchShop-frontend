import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { PickupQr } from "@/types/qr";

type PickupQrCardProps = {
  qr: PickupQr;
  compact?: boolean;
};

export function PickupQrCard({ qr, compact = false }: PickupQrCardProps) {
  if (qr.status === "pending") {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3">
        <Spinner label="Génération du QR de retrait" />
        <p className="text-sm text-tdev-muted">Préparation du pass de retrait…</p>
      </Card>
    );
  }

  if (qr.status === "unavailable") {
    return (
      <Alert title="QR indisponible" tone="error">
        Le pass de retrait n&apos;est pas encore disponible. Il sera fourni par le
        backend après confirmation du paiement.
      </Alert>
    );
  }

  const frame = (
    <>
      {qr.imageUrl ? (
        // Image backend — pas de génération cryptographique côté client.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr.imageUrl}
          alt={qr.alt}
          className="motion-qr h-auto w-full max-w-xs bg-tdev-white p-3"
        />
      ) : (
        <div
          className="motion-qr flex aspect-square w-[192px] max-w-full items-center justify-center bg-[#f5f5f3] p-4 text-center text-xs text-tdev-black"
          role="img"
          aria-label={qr.alt}
        >
          QR fourni par le backend
          <br />
          (mock)
        </div>
      )}
    </>
  );

  if (compact) {
    return <div className="flex items-center justify-center">{frame}</div>;
  }

  return (
    <Card className="flex w-full flex-col items-center gap-4 p-6">
      <p className="text-sm text-tdev-muted">À présenter au stand Merch</p>
      {frame}
      <p className="text-xs text-tdev-muted">
        L&apos;affichage n&apos;est pas une preuve de validité. Le scan
        Chantier 3B valide le pass côté serveur.
      </p>
    </Card>
  );
}
