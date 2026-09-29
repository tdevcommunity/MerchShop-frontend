"use client";

import Link from "next/link";
import { useCart } from "@/features/cart/hooks/use-cart";
import { siteConfig } from "@/lib/config/site";

const nav = [{ href: "/shop", label: "Catalogue" }];

export function SiteHeader() {
  const cart = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-tdev-black/95 backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-headline text-base text-tdev-yellow">
          {siteConfig.shortName}
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-11 rounded-md px-3 py-2 text-sm text-tdev-white hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="relative min-h-11 min-w-11 rounded-md px-3 py-2 text-sm text-tdev-black bg-tdev-yellow"
            aria-label={`Panier, ${cart.itemCount} article${cart.itemCount > 1 ? "s" : ""}`}
          >
            Panier
            {cart.itemCount > 0 ? (
              <span className="ml-1 tabular-nums">({cart.itemCount})</span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
