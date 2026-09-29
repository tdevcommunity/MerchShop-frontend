import { notFound } from "next/navigation";
import { ProductPurchasePanel } from "@/features/product/components/product-purchase-panel";
import { getProductBySlug } from "@/features/product/services/product-service";
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

  return (
    <article className="grid gap-8 lg:grid-cols-2">
      <div
        className="order-2 aspect-[4/3] max-h-72 rounded-lg bg-white/5 lg:order-1 lg:max-h-none lg:aspect-[4/5]"
        aria-hidden="true"
      />
      <div className="order-1 lg:order-2">
        <ProductPurchasePanel product={product} />
      </div>
    </article>
  );
}
