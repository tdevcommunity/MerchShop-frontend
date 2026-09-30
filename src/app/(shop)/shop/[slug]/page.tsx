import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/features/product/components/product-gallery";
import { ProductPurchasePanel } from "@/features/product/components/product-purchase-panel";
import { RelatedProducts } from "@/features/product/components/related-products";
import { getProductBySlug } from "@/features/product/services/product-service";
import { listProducts, listShopCategories } from "@/features/catalog/services/catalog-service";
import { categoryLabel, categorySlug } from "@/features/catalog/utils";
import { isNotFoundError } from "@/lib/api/errors";
import { createMetadata } from "@/lib/seo/create-metadata";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return createMetadata({
      title: product.name,
      description: product.description,
      path: `/shop/${product.slug}`,
    });
  } catch {
    return createMetadata({ title: "Produit", path: `/shop/${slug}` });
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product;

  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const catSlug = categorySlug(product.category);
  const [relatedAll, categories] = await Promise.all([
    listProducts({ category: catSlug }),
    listShopCategories(),
  ]);
  const related = relatedAll.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <div className="px-5 py-8 lg:px-12 lg:py-12">
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-tdev-muted">
        <Link href="/shop" className="hover:text-tdev-anthracite">
          Boutique
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          href={`/shop?category=${catSlug}`}
          className="hover:text-tdev-anthracite"
        >
          {(() => {
            const label =
              product.categoryLabel ?? categoryLabel(product.category, categories);
            if (typeof label === "string") return label;
            if (label && typeof label === "object") {
              return (label as { name?: string; label?: string }).name ?? (label as { name?: string; label?: string }).label ?? "";
            }
            return String(label ?? "");
          })()}
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-tdev-anthracite">{product.name}</span>
      </nav>
      <article className="motion-page grid gap-8 lg:grid-cols-2">
        <ProductGallery product={product} />
        <ProductPurchasePanel product={product} />
      </article>
      <RelatedProducts products={related} />
    </div>
  );
}
