import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/features/catalog/components/product-card";
import type { Product } from "@/types/catalog";

type CatalogGridProps = {
  products: Product[];
};

export function CatalogGrid({ products }: CatalogGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Aucun produit"
        description="Le catalogue ne contient aucun article pour ce filtre."
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <li key={product.id} className={index === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}>
          <ProductCard product={product} featured={index === 0} />
        </li>
      ))}
    </ul>
  );
}
