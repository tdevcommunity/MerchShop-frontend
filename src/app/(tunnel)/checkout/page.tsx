import { CheckoutIndexRedirect } from "@/features/checkout/components/checkout-index-redirect";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Checkout",
  path: "/checkout",
});

export default function CheckoutIndexPage() {
  return <CheckoutIndexRedirect />;
}
