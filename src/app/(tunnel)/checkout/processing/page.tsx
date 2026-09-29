import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { PaymentProcessingView } from "@/features/checkout/components/payment-processing-view";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Paiement en cours",
  path: "/checkout/processing",
});

export default function CheckoutProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-tdev-anthracite">
          <Spinner label="Paiement en cours" />
        </div>
      }
    >
      <PaymentProcessingView />
    </Suspense>
  );
}
