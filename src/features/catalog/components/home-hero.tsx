import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { buttonClassName } from "@/components/ui/button";
import { ProductImage } from "@/features/catalog/components/product-image";
import { productFromPrice } from "@/features/catalog/utils";
import { formatMoney } from "@/lib/utils/format-money";
import type { Product } from "@/types/catalog";

type HomeHeroProps = {
  product: Product | undefined;
};

export function HomeHero({ product }: HomeHeroProps) {
  return (
    <section className="flex flex-col border-b border-tdev-anthracite lg:flex-row lg:min-h-[560px]">
      <div className="flex flex-1 flex-col justify-center gap-6 px-5 py-12 lg:px-12 lg:py-16">
        <p className="motion-enter flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[2.6px]">
          <span className="size-2.5 bg-tdev-green" aria-hidden="true" />
          Merch officiel • Edition 2026
        </p>
        <h1 className="motion-enter motion-delay-1 font-headline text-5xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-[88px]">
          Porte
          <br />
          le <span className="text-tdev-blue">festival</span>
        </h1>
        <p className="motion-enter motion-delay-2 max-w-[440px] text-[17px] text-tdev-subtle">
          La collection officielle du TDEV Festival 2026. T-shirts, casquettes,
          stickers et objets en édition limitée. Retire sur place ou fais-toi
          livrer.
        </p>
        <div className="motion-enter motion-delay-3 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <Link href="/shop" className={buttonClassName("brand", "lg")}>
            Voir la boutique
            <ArrowRightIcon className="size-[18px] text-tdev-yellow" />
          </Link>
          <Link href="/shop" className={buttonClassName("secondary", "lg")}>
            Nouveautés
          </Link>
        </div>
      </div>
      <div className="motion-fade relative min-h-[320px] border-t border-tdev-anthracite bg-tdev-anthracite lg:w-[560px] lg:border-l lg:border-t-0">
        <ProductImage
          src={product?.imageUrl ?? null}
          alt={product?.name ?? "Produit mis en avant"}
          className="h-full min-h-[320px] aspect-auto lg:min-h-[560px]"
          priority
        />
        <span className="absolute left-7 top-7 bg-tdev-yellow px-3.5 py-2 font-headline text-[13px] font-extrabold uppercase tracking-[0.325px]">
          Drop 01
        </span>
        {product ? (
          <div className="absolute bottom-7 right-7 border-2 border-tdev-anthracite bg-tdev-white px-[18px] py-3">
            <p className="text-[11px] font-bold uppercase tracking-[1.1px] text-tdev-muted">
              {product.name}
            </p>
            <p className="font-headline text-[22px] font-extrabold">
              {formatMoney(productFromPrice(product))}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
