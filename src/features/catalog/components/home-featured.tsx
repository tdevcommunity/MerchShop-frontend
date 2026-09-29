import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { CartIcon } from "@/components/ui/icons";
import { ProductImage } from "@/features/catalog/components/product-image";
import { productFromPrice } from "@/features/catalog/utils";
import { formatMoney } from "@/lib/utils/format-money";
import type { Product } from "@/types/catalog";

type HomeFeaturedProps = {
  product: Product | undefined;
};

export function HomeFeatured({ product }: HomeFeaturedProps) {
  if (!product) {
    return null;
  }

  const inStock = product.variants.some((variant) => variant.stockQuantity > 0);

  return (
    <section className="flex flex-col border-b border-tdev-anthracite bg-tdev-anthracite text-tdev-white lg:min-h-[520px] lg:flex-row">
      <div className="relative min-h-[280px] shrink-0 border-b border-[#3a3a3a] lg:w-[620px] lg:border-b-0 lg:border-r">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full min-h-[280px] aspect-auto bg-tdev-subtle lg:min-h-[520px]"
        />
        <p className="absolute left-6 top-5 font-headline text-7xl font-extrabold leading-none lg:text-[120px]">
          01
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-[22px] px-5 py-12 lg:px-14 lg:py-16">
        <p className="text-[13px] font-bold uppercase tracking-[2.6px] text-tdev-yellow">
          Produit du moment
        </p>
        <h2 className="font-headline text-4xl font-extrabold uppercase leading-[0.95] tracking-tight lg:text-[56px]">
          {product.name}
        </h2>
        <p className="max-w-[420px] text-base leading-relaxed text-[#b5b5b5]">
          {product.description}
        </p>
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <p className="font-headline text-[34px] font-extrabold text-tdev-yellow">
            {formatMoney(productFromPrice(product))}
          </p>
          <p className="flex items-center gap-2 text-[13px] font-medium text-[#b5b5b5]">
            <span
              className={inStock ? "size-[9px] bg-tdev-green" : "size-[9px] bg-tdev-orange"}
              aria-hidden="true"
            />
            {inStock ? "En stock" : "Indisponible"}
          </p>
        </div>
        <Link
          href={`/shop/${product.slug}`}
          className={buttonClassName("primary", "lg", "w-fit")}
        >
          Voir le produit
          <CartIcon className="size-[18px]" />
        </Link>
      </div>
    </section>
  );
}
