import { CartView } from "@/features/cart/components/cart-view";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "Mon panier",
  path: "/cart",
});

export default function CartPage() {
  return (
    <div className="flex flex-col gap-6 px-5 py-10 lg:px-12 lg:py-16">
      <header>
        <p className="text-[13px] font-bold uppercase tracking-[2.6px] text-tdev-blue">
          Selection
        </p>
        <h1 className="mt-2 font-headline text-4xl font-extrabold uppercase tracking-tight lg:text-[44px]">
          Mon panier
        </h1>
      </header>
      <CartView />
    </div>
  );
}
