import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { PickupQr } from "@/types/qr";

type PickupQrCardProps = {
  qr: PickupQr;
};

export function PickupQrCard({ qr }: PickupQrCardProps) {
  if (qr.status === "pending") {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3">
        <Spinner label="Génération du QR de retrait" />
        <p className="text-sm text-white/70">Préparation du pass de retrait…</p>
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

  return (
    <Card className="flex flex-col items-center gap-4 p-6">
      <p className="text-sm text-white/70">À présenter au stand Merch</p>
      {qr.imageUrl ? (
        // Image backend — pas de génération cryptographique côté client.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr.imageUrl}
          alt={qr.alt}
          className="h-auto w-full max-w-xs bg-tdev-white p-3"
        />
      ) : (
        <div
          className="flex aspect-square w-full max-w-xs items-center justify-center bg-tdev-white p-4 text-center text-sm text-tdev-black"
          role="img"
          aria-label={qr.alt}
        >
          QR fourni par le backend
          <br />
          (mock — image non générée ici)
        </div>
      )}
      <p className="text-xs text-white/50">
        L&apos;affichage n&apos;est pas une preuve de validité. Le scan Chantier 3B
        valide le pass côté serveur.
      </p>
    </Card>
  );
}
