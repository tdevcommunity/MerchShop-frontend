import Link from "next/link";
import { ProductCard } from "@/features/catalog/components/product-card";
import type { Product } from "@/types/catalog";

type HomeEssentialsProps = {
  products: Product[];
};

export function HomeEssentials({ products }: HomeEssentialsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-7 border-b border-tdev-anthracite px-5 py-16 lg:px-12">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] font-bold uppercase tracking-[2.6px] text-tdev-blue">
            Selection
          </p>
          <h2 className="font-headline text-3xl font-extrabold uppercase tracking-tight lg:text-[44px]">
            Nos essentiels
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-bold uppercase tracking-[0.35px] text-tdev-blue"
        >
          Voir la boutique
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
