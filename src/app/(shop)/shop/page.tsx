import { CatalogGrid } from "@/features/catalog/components/catalog-grid";
import { CategoryFilter } from "@/features/catalog/components/category-filter";
import { listProducts, listShopCategories } from "@/features/catalog/services/catalog-service";
import { categoryLabel } from "@/features/catalog/utils";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "La boutique",
  path: "/shop",
});

type ShopPageProps = {
  searchParams: Promise<{ category?: string; query?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categories = await listShopCategories();
  const category = categories.some((item) => item.slug === params.category)
    ? params.category
    : undefined;
  const query = params.query?.trim() || undefined;
  const products = await listProducts({ category, query });

  const heading = category ? categoryLabel(category, categories) : "La boutique";

  return (
    <div className="flex flex-col gap-6 px-5 py-10 lg:px-12 lg:py-16">
      <header className="motion-enter flex flex-col gap-4">
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
        <CategoryFilter categories={categories} active={category} query={query} />
      </header>
      <CatalogGrid products={products} />
    </div>
  );
}
