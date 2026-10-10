"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CatalogGrid } from "@/features/catalog/components/catalog-grid";
import { CategoryFilter } from "@/features/catalog/components/category-filter";
import { filterProductsByQuery } from "@/features/catalog/utils/search";
import type { Category, Product } from "@/types/catalog";

type CatalogBrowserProps = {
  products: Product[];
  categories: Category[];
  activeCategory?: string;
  initialQuery?: string;
  heading: string;
  sortNewest?: boolean;
};

export function CatalogBrowser({
  products,
  categories,
  activeCategory,
  initialQuery = "",
  heading,
  sortNewest = false,
}: CatalogBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [, startTransition] = useTransition();
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const [prevActiveCategory, setPrevActiveCategory] = useState(activeCategory);

  if (initialQuery !== prevInitialQuery || activeCategory !== prevActiveCategory) {
    setPrevInitialQuery(initialQuery);
    setPrevActiveCategory(activeCategory);
    setQuery(initialQuery);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (activeCategory) {
        params.set("category", activeCategory);
      }
      if (sortNewest) {
        params.set("sort", "newest");
      }
      const trimmed = query.trim();
      if (trimmed) {
        params.set("query", trimmed);
      }
      const next = params.toString();
      const current = window.location.search.replace(/^\?/, "");
      if (next === current) {
        return;
      }
      startTransition(() => {
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [activeCategory, pathname, query, router, sortNewest]);

  const filtered = useMemo(
    () => filterProductsByQuery(products, query),
    [products, query],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="motion-enter flex flex-col gap-4">
        <p className="text-[13px] font-bold uppercase tracking-[2.6px] text-tdev-blue">
          Catalogue
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-headline text-4xl font-extrabold uppercase tracking-tight lg:text-[44px]">
            {heading}
          </h1>
          <div className="flex items-center gap-4">
            {sortNewest ? (
              <Link
                href="/shop"
                className="text-[11px] font-bold uppercase tracking-[0.12em] text-tdev-muted underline-offset-2 hover:text-tdev-anthracite hover:underline"
              >
                Voir tout
              </Link>
            ) : null}
            <p className="text-sm text-tdev-muted">
              {filtered.length} article{filtered.length > 1 ? "s" : ""}
              {query.trim() ? ` pour « ${query.trim()} »` : ""}
            </p>
          </div>
        </div>

        <label className="flex max-w-xl flex-col gap-1.5">
          <span className="text-[13px] font-bold uppercase tracking-[1.8px]">
            Recherche
          </span>
          <div className="relative">
            <input
              type="search"
              name="catalog-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, couleur, taille, SKU…"
              autoComplete="off"
              className="h-12 w-full border border-tdev-anthracite bg-tdev-white px-3 pr-20 text-tdev-anthracite placeholder:text-tdev-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tdev-blue"
            />
            {query ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-tdev-muted hover:text-tdev-anthracite"
                onClick={() => setQuery("")}
              >
                Effacer
              </button>
            ) : null}
          </div>
        </label>

        <CategoryFilter
          categories={categories}
          active={activeCategory}
          query={query.trim() || undefined}
          sort={sortNewest ? "newest" : undefined}
        />
      </header>

      <CatalogGrid products={filtered} />
    </div>
  );
}
