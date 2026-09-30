import { HomeCategories } from "@/features/catalog/components/home-categories";
import { HomeCtaBanner } from "@/features/catalog/components/home-cta-banner";
import { HomeEssentials } from "@/features/catalog/components/home-essentials";
import { HomeFeatured } from "@/features/catalog/components/home-featured";
import { HomeHero } from "@/features/catalog/components/home-hero";
import { HomeMarquee } from "@/features/catalog/components/home-marquee";
import { listProducts, listShopCategories } from "@/features/catalog/services/catalog-service";
import { EmptyState } from "@/components/shared/empty-state";
import { createMetadata } from "@/lib/seo/create-metadata";
import { buttonClassName } from "@/components/ui/button";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Accueil",
  path: "/",
});

export default async function HomePage() {
  const [products, categories] = await Promise.all([listProducts(), listShopCategories()]);
  const hero = products.find((product) => product.slug === "tshirt-tdev-core");
  const featured = products.find((product) => product.slug === "hoodie-tdev-night");
  const essentials = products.slice(0, 4);

  if (products.length === 0) {
    return (
      <div className="px-5 py-16 lg:px-12">
        <EmptyState
          title="Boutique bientôt disponible"
          description="Aucun produit n'est encore publié dans le catalogue."
          action={
            <Link href="/shop" className={buttonClassName("brand", "lg")}>
              Voir le catalogue
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <HomeHero product={hero ?? products[0]} />
      <HomeMarquee />
      <HomeCategories products={products} categories={categories} />
      <HomeFeatured product={featured ?? products[1] ?? products[0]} />
      <HomeEssentials products={essentials} />
      <HomeCtaBanner />
    </>
  );
}
