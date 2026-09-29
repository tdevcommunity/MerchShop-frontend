import Link from "next/link";
import { ProductCard } from "@/features/catalog/components/product-card";
import type { Product } from "@/types/catalog";

type RelatedProductsProps = {
  products: Product[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 flex flex-col gap-7 border-t border-tdev-anthracite pt-12">
      <div className="flex items-end justify-between">
        <h2 className="font-headline text-3xl font-extrabold uppercase tracking-tight">
          Ça va avec
        </h2>
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
