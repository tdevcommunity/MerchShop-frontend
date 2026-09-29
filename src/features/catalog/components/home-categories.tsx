import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { ProductImage } from "@/features/catalog/components/product-image";
import { CATEGORY_LABELS } from "@/features/catalog/utils";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/types/catalog";

type HomeCategoriesProps = {
  products: Product[];
};

export function HomeCategories({ products }: HomeCategoriesProps) {
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
        {PRODUCT_CATEGORIES.map((category) => {
          const count = products.filter((product) => product.category === category).length;
          const sample = products.find((product) => product.category === category);
          return (
            <li key={category}>
              <CategoryCard
                category={category}
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
  category,
  count,
  imageUrl,
}: {
  category: ProductCategory;
  count: number;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/shop?category=${category}`}
      className="relative block h-[240px] overflow-hidden border border-tdev-anthracite"
    >
      <ProductImage
        src={imageUrl}
                      alt={CATEGORY_LABELS[category]}
        className="h-full aspect-auto"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-tdev-anthracite bg-tdev-white px-4 py-3.5">
        <span>
          <span className="block font-headline text-[17px] font-extrabold uppercase leading-tight">
            {CATEGORY_LABELS[category]}
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
