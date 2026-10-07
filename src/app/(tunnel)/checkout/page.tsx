import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Checkout",
  path: "/checkout",
});

export default function CheckoutIndexPage() {
  redirect("/checkout/fulfillment");
}
