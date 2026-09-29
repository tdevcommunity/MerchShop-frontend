import Link from "next/link";
import { CATEGORY_LABELS } from "@/features/catalog/utils";
import { cn } from "@/lib/utils/cn";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types/catalog";

type CategoryFilterProps = {
  active?: ProductCategory;
  query?: string;
};

function hrefFor(category?: ProductCategory, query?: string): string {
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (query) {
    params.set("query", query);
  }
  const search = params.toString();
  return search ? `/shop?${search}` : "/shop";
}

export function CategoryFilter({ active, query }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
      <FilterPill href={hrefFor(undefined, query)} selected={!active}>
        Tous
      </FilterPill>
      {PRODUCT_CATEGORIES.map((category) => (
        <FilterPill
          key={category}
          href={hrefFor(category, query)}
          selected={active === category}
        >
          {CATEGORY_LABELS[category]}
        </FilterPill>
      ))}
    </div>
  );
}

function FilterPill({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center border px-4 text-sm font-semibold",
        selected
          ? "border-tdev-anthracite bg-tdev-anthracite text-tdev-white"
          : "border-tdev-anthracite bg-tdev-white text-tdev-anthracite hover:bg-tdev-surface",
      )}
      aria-current={selected ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
