import { CatalogGrid } from "@/features/catalog/components/catalog-grid";
import { listProducts } from "@/features/catalog/services/catalog-service";
import { createMetadata } from "@/lib/seo/create-metadata";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types/catalog";

export const metadata = createMetadata({
  title: "Catalogue",
  path: "/shop",
});

type ShopPageProps = {
  searchParams: Promise<{ category?: string }>;
};

function isCategory(value: string | undefined): value is ProductCategory {
  return Boolean(value && PRODUCT_CATEGORIES.includes(value as ProductCategory));
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const category = isCategory(params.category) ? params.category : undefined;
  const products = await listProducts({ category });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl">Catalogue</h1>
        <p className="text-sm text-white/70">
          Textile, accessoires et bagagerie du TDEV Festival 2026.
        </p>
      </header>
      <CatalogGrid products={products} />
    </div>
  );
}
