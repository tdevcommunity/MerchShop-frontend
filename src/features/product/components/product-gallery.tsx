import { ProductImage } from "@/features/catalog/components/product-image";
import type { Product } from "@/types/catalog";

type ProductGalleryProps = {
  product: Product;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  return (
    <div
      key={product.imageUrl ?? product.id}
      className="motion-fade overflow-hidden border border-tdev-anthracite bg-tdev-surface"
    >
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        className="min-h-[320px] aspect-[4/5] lg:min-h-[560px]"
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    </div>
  );
}
