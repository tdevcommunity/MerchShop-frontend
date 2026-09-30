import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { ProductImage } from "@/features/catalog/components/product-image";
import { categorySlug } from "@/features/catalog/utils";
import { staggerDelay } from "@/lib/motion";
import type { Category, Product } from "@/types/catalog";

type HomeCategoriesProps = {
  products: Product[];
  categories: Category[];
};

export function HomeCategories({ products, categories }: HomeCategoriesProps) {
  return (
    <section className="flex flex-col gap-7 border-b border-tdev-anthracite px-5 py-16 lg:px-12">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-headline text-3xl font-extrabold uppercase tracking-tight lg:text-[44px]">
          Catégories
        </h2>
        <Link
          href="/shop"
          className="text-sm font-bold uppercase tracking-[0.35px] text-tdev-blue"
        >
          Tout voir
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => {
          const count = products.filter((product) => categorySlug(product.category) === category.slug).length;
          const sample = products.find((product) => categorySlug(product.category) === category.slug);
          return (
            <li
              key={category.slug}
              className="motion-enter"
              style={{ animationDelay: staggerDelay(index) }}
            >
              <CategoryCard
                slug={category.slug}
                label={category.label}
                count={count}
                imageUrl={sample?.imageUrl ?? null}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CategoryCard({
  slug,
  label,
  count,
  imageUrl,
}: {
  slug: string;
  label: string;
  count: number;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/shop?category=${slug}`}
      className="motion-img-zoom relative block h-[240px] overflow-hidden border border-tdev-anthracite"
    >
      <ProductImage
        src={imageUrl}
        alt={label}
        className="h-full aspect-auto"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-tdev-anthracite bg-tdev-white px-4 py-3.5">
        <span>
          <span className="block font-headline text-[17px] font-extrabold uppercase leading-tight">
            {label}
          </span>
          <span className="text-xs font-medium text-tdev-muted">
            {count} article{count > 1 ? "s" : ""}
          </span>
        </span>
        <ArrowUpRightIcon className="size-5 text-tdev-blue" />
      </span>
    </Link>
  );
}
