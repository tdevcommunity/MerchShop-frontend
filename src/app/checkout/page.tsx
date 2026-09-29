import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Checkout",
  path: "/checkout",
});

export default function CheckoutPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-headline text-3xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
