import { CatalogGrid } from "@/features/catalog/components/catalog-grid";
import { CategoryFilter } from "@/features/catalog/components/category-filter";
import { listProducts } from "@/features/catalog/services/catalog-service";
import { CATEGORY_LABELS } from "@/features/catalog/utils";
import { createMetadata } from "@/lib/seo/create-metadata";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types/catalog";

export const metadata = createMetadata({
  title: "La boutique",
  path: "/shop",
});

type ShopPageProps = {
  searchParams: Promise<{ category?: string; query?: string }>;
};

function isCategory(value: string | undefined): value is ProductCategory {
  return Boolean(value && PRODUCT_CATEGORIES.includes(value as ProductCategory));
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const category = isCategory(params.category) ? params.category : undefined;
  const query = params.query?.trim() || undefined;
  const products = await listProducts({ category, query });

  const heading = category ? CATEGORY_LABELS[category] : "La boutique";

  return (
    <div className="flex flex-col gap-6 px-5 py-10 lg:px-12 lg:py-16">
      <header className="flex flex-col gap-4">
        <p className="text-[13px] font-bold uppercase tracking-[2.6px] text-tdev-blue">
          Catalogue
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-headline text-4xl font-extrabold uppercase tracking-tight lg:text-[44px]">
            {heading}
          </h1>
          <p className="text-sm text-tdev-muted">
            {products.length} article{products.length > 1 ? "s" : ""}
            {query ? ` pour « ${query} »` : ""}
          </p>
        </div>
        <CategoryFilter active={category} query={query} />
      </header>
      <CatalogGrid products={products} />
    </div>
  );
}
