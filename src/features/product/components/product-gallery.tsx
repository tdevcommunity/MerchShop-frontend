import { ProductImage } from "@/features/catalog/components/product-image";

type ProductGalleryProps = {
  name: string;
  imageUrl: string | null;
};

export function ProductGallery({ name, imageUrl }: ProductGalleryProps) {
  return (
    <div
      key={imageUrl ?? name}
      className="motion-fade overflow-hidden border border-tdev-anthracite bg-tdev-surface"
    >
      <ProductImage
        src={imageUrl}
        alt={name}
        className="min-h-[320px] aspect-[4/5] lg:min-h-[560px]"
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    </div>
  );
}
