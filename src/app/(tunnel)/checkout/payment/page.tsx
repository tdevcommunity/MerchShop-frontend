import { PaymentForm } from "@/features/checkout/components/payment-form";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Paiement",
  path: "/checkout/payment",
});

export default function CheckoutPaymentPage() {
  return <PaymentForm />;
}
