import { CheckoutPaymentRedirect } from "@/features/checkout/components/checkout-payment-redirect";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Paiement",
  path: "/checkout/payment",
});

export default function CheckoutPaymentPage() {
  return <CheckoutPaymentRedirect />;
}
