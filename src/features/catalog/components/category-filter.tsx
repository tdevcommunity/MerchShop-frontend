import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types/catalog";

type CategoryFilterProps = {
  categories: Category[];
  active?: string;
  query?: string;
  sort?: string;
};

function hrefFor(category?: string, query?: string, sort?: string): string {
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (query) {
    params.set("query", query);
  }
  if (sort) {
    params.set("sort", sort);
  }
  const search = params.toString();
  return search ? `/shop?${search}` : "/shop";
}

export function CategoryFilter({ categories, active, query, sort }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
      <FilterPill href={hrefFor(undefined, query, sort)} selected={!active}>
        Tous
      </FilterPill>
      {categories.map((category) => (
        <FilterPill
          key={category.slug}
          href={hrefFor(category.slug, query, sort)}
          selected={active === category.slug}
        >
          {category.label}
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
        "transition-colors duration-150",
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
