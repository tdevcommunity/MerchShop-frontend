import { CartView } from "@/features/cart/components/cart-view";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Panier",
  path: "/cart",
});

export default function CartPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl">Panier</h1>
      <CartView />
    </div>
  );
}
