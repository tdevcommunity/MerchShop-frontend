import { OrderConfirmation } from "@/features/order/components/order-confirmation";
import { Alert } from "@/components/ui/alert";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Confirmation",
  path: "/checkout/confirmation",
});

type ConfirmationPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <Alert title="Commande manquante" tone="error">
        Aucun identifiant de commande n&apos;a été fourni après le paiement.
      </Alert>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-headline text-3xl">Confirmation</h1>
      <OrderConfirmation orderId={orderId} />
    </div>
  );
}
