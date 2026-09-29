import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/format-money";
import type { Product } from "@/types/catalog";

const categoryLabel: Record<Product["category"], string> = {
  textile: "Textile",
  accessories: "Accessoires",
  bagagerie: "Bagagerie",
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const prices = product.variants.map((variant) => variant.unitPrice);
  const fromPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return (
    <Link href={`/shop/${product.slug}`} className="block h-full">
      <Card className="flex h-full flex-col gap-3 p-0 overflow-hidden transition-colors hover:border-tdev-yellow/50">
        <div className="aspect-[4/3] bg-white/5" aria-hidden="true" />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Badge className="self-start">{categoryLabel[product.category]}</Badge>
          <h2 className="font-headline text-lg text-tdev-white">{product.name}</h2>
          <p className="mt-auto text-sm text-tdev-yellow">
            À partir de {formatMoney(fromPrice)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
