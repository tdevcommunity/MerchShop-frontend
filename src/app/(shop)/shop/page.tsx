import { CatalogBrowser } from "@/features/catalog/components/catalog-browser";
import { listProducts, listShopCategories } from "@/features/catalog/services/catalog-service";
import { categoryLabel } from "@/features/catalog/utils";
import { createMetadata } from "@/lib/seo/create-metadata";

export const metadata = createMetadata({
  title: "La boutique",
  path: "/shop",
});

type ShopPageProps = {
  searchParams: Promise<{ category?: string; query?: string; sort?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categories = await listShopCategories();
  const category = categories.some((item) => item.slug === params.category)
    ? params.category
    : undefined;
  const initialQuery = params.query?.trim() ?? "";
  const sortNewest = params.sort === "newest";
  const products = await listProducts({ category });

  // Tri par nouveauté : l'API renvoie par ordre d'insertion ; on inverse pour
  // mettre les plus récents en premier sans requete supplémentaire.
  const sortedProducts = sortNewest ? [...products].reverse() : products;

  const heading = sortNewest
    ? "Nouveautés"
    : category
      ? categoryLabel(category, categories)
      : "La boutique";

  return (
    <div className="flex flex-col px-5 py-10 lg:px-12 lg:py-16">
      <CatalogBrowser
        products={sortedProducts}
        categories={categories}
        activeCategory={category}
        initialQuery={initialQuery}
        heading={heading}
        sortNewest={sortNewest}
      />
    </div>
  );
}
