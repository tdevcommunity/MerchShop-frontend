import { FulfillmentForm } from "@/features/checkout/components/fulfillment-form";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Mode de réception",
  path: "/checkout/fulfillment",
});

export default function CheckoutFulfillmentPage() {
  return <FulfillmentForm />;
}
