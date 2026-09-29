"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import {
  CartIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { useCart } from "@/features/cart/hooks/use-cart";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/shop", label: "Boutique" },
  { href: "/shop", label: "Nouveautés" },
  { href: "/shop?category=textile", label: "Collections" },
  { href: "/#festival", label: "Le Festival" },
];

export function SiteHeader() {
  const cart = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    const href = nextQuery
      ? `/shop?query=${encodeURIComponent(nextQuery)}`
      : "/shop";
    router.push(href);
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-tdev-anthracite bg-tdev-white">
      <div className="flex min-h-[72px] items-center gap-4 px-5 lg:px-12">
        <Link href="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
          <BrandMark />
          <span className="sr-only">Accueil TDEV Shop</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden flex-1 items-center gap-8 pl-10 lg:flex"
        >
          {nav.map((item) => {
            const isBoutique = item.label === "Boutique" && pathname.startsWith("/shop");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "min-h-11 text-sm",
                  isBoutique
                    ? "font-semibold text-tdev-anthracite"
                    : "font-medium text-tdev-muted hover:text-tdev-anthracite",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            className="flex size-10 items-center justify-center border border-tdev-anthracite lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            {menuOpen ? (
              <CloseIcon className="size-[18px]" />
            ) : (
              <MenuIcon className="size-[18px]" />
            )}
            <span className="sr-only">
              {menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            </span>
          </button>

          <button
            type="button"
            className="flex size-10 items-center justify-center border border-tdev-anthracite"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMenuOpen(false);
            }}
          >
            <SearchIcon className="size-[18px]" />
            <span className="sr-only">Rechercher</span>
          </button>

          <Link
            href="/cart"
            className="flex h-10 items-center gap-2 bg-tdev-anthracite px-3.5 text-[13px] font-semibold text-tdev-white"
            aria-label={`Panier, ${cart.itemCount} article${cart.itemCount > 1 ? "s" : ""}`}
          >
            <CartIcon className="size-[18px] text-tdev-yellow" />
            <span className="hidden sm:inline">Panier</span>
            {cart.itemCount > 0 ? (
              <span className="flex size-5 items-center justify-center bg-tdev-orange text-xs font-bold">
                {cart.itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <form
          id="site-search"
          onSubmit={handleSearch}
          className="flex gap-2 border-t border-tdev-anthracite px-5 py-3 lg:px-12"
        >
          <label htmlFor="header-query" className="sr-only">
            Rechercher un produit
          </label>
          <input
            id="header-query"
            name="query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit"
            className="min-h-11 flex-1 border border-tdev-anthracite px-3"
          />
          <button type="submit" className="min-h-11 bg-tdev-blue px-4 text-sm font-bold uppercase tracking-wide text-tdev-white">
            Chercher
          </button>
        </form>
      ) : null}

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Navigation mobile"
          className="flex flex-col border-t border-tdev-anthracite lg:hidden"
        >
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="min-h-12 border-b border-tdev-border px-5 py-3 text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
