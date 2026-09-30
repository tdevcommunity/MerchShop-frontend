import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CartIcon } from "@/components/ui/icons";
import { ProductImage } from "@/features/catalog/components/product-image";
import {
  PRODUCT_BADGE_LABELS,
  productFromPrice,
} from "@/features/catalog/utils";
import { formatMoney } from "@/lib/utils/format-money";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/catalog";

type ProductCardProps = {
  product: Product;
  featured?: boolean;
};

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const fromPrice = productFromPrice(product);

  return (
    <article
      className={cn(
        "flex h-full flex-col border border-tdev-anthracite bg-tdev-white",
        featured && "lg:col-span-2",
      )}
    >
      <Link href={`/shop/${product.slug}`} className="motion-img-zoom flex h-full flex-col">
        <div className="relative overflow-hidden border-b border-tdev-anthracite bg-tdev-surface">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className={featured ? "aspect-[16/9] lg:aspect-[2/1]" : "h-[240px] aspect-auto"}
          />
          {product.badge ? (
            <Badge
              tone={product.badge}
              className="absolute left-3 top-3"
            >
              {PRODUCT_BADGE_LABELS[product.badge]}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-1 items-end justify-between gap-3 p-4">
          <div className="flex min-w-0 flex-col gap-2.5">
            <h2 className="font-headline text-base font-bold leading-tight text-tdev-anthracite">
              {product.name}
            </h2>
            <p className="font-headline text-lg font-extrabold">
              {formatMoney(fromPrice)}
            </p>
          </div>
          <span
            className="motion-zoom-target flex size-9 shrink-0 items-center justify-center bg-tdev-blue text-tdev-white transition-transform duration-200"
            aria-hidden="true"
          >
            <CartIcon className="size-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
