"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { adminList, adminRequest } from "@/features/admin/services/admin-client";
import { cn } from "@/lib/utils/cn";
import type { AdminNotification, AdminRole, AdminSessionUser } from "@/types/admin";

const NAV: Array<{ href: string; label: string; roles: AdminRole[] }> = [
  { href: "/admin/dashboard", label: "Dashboard", roles: ["admin", "staff"] },
  { href: "/admin/products", label: "Produits", roles: ["admin"] },
  { href: "/admin/categories", label: "Catégories", roles: ["admin"] },
  { href: "/admin/inventory", label: "Stock", roles: ["admin", "staff"] },
  { href: "/admin/orders", label: "Commandes", roles: ["admin", "staff"] },
  { href: "/admin/payments", label: "Paiements", roles: ["admin", "staff"] },
  { href: "/admin/pickups", label: "Retraits", roles: ["admin", "staff"] },
  { href: "/admin/users", label: "Utilisateurs", roles: ["admin"] },
  { href: "/admin/audit", label: "Audit", roles: ["admin"] },
  { href: "/admin/notifications", label: "Alertes", roles: ["admin", "staff"] },
  { href: "/admin/settings", label: "Paramètres", roles: ["admin"] },
];

type AdminShellProps = {
  children: ReactNode;
};

function AdminNavLinks({
  links,
  pathname,
  onNavigate,
}: {
  links: typeof NAV;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {links.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "min-h-11 px-3 py-2.5 text-sm font-bold uppercase tracking-[0.08em]",
              active ? "bg-tdev-blue text-tdev-white" : "hover:bg-tdev-surface",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<AdminNotification[]>([]);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    void adminRequest<AdminSessionUser>("/api/admin/me")
      .then(setUser)
      .catch(() => router.replace("/admin/login"));
    void adminList<AdminNotification>("/api/admin/notifications").then(setNotes);
  }, [router]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function logout() {
    await adminRequest("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function search(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) {
      return;
    }
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
  }

  const unread = notes.filter((note) => !note.read).length;
  const links = NAV.filter((item) => !user || item.roles.includes(user.role));

  return (
    <div className="min-h-dvh bg-tdev-surface text-tdev-anthracite">
      <header className="sticky top-0 z-30 border-b border-tdev-anthracite bg-tdev-white pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:h-16 lg:px-6">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-nav"
            className="inline-flex h-10 shrink-0 items-center justify-center border border-tdev-anthracite px-2.5 text-[11px] font-extrabold uppercase lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Fermer" : "Menu"}
          </button>
          <Link href="/admin/dashboard" className="min-w-0 shrink">
            <BrandMark className="origin-left scale-90 sm:scale-100 [&_[data-brand-wordmark]]:hidden sm:[&_[data-brand-wordmark]]:inline" />
          </Link>
          <span className="hidden font-headline text-xs font-extrabold uppercase tracking-[0.16em] text-tdev-muted xl:inline">
            Admin Shop
          </span>

          <form onSubmit={search} className="ml-auto hidden min-w-0 flex-1 max-w-md md:block">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Commande, client, SKU, produit…"
              className="h-10 w-full border border-tdev-anthracite bg-tdev-white px-3 text-sm"
            />
          </form>

          <button
            type="button"
            aria-expanded={searchOpen}
            className="ml-auto inline-flex h-10 shrink-0 items-center justify-center border border-tdev-anthracite px-2.5 text-[11px] font-extrabold uppercase md:ml-0 md:hidden"
            onClick={() => setSearchOpen((open) => !open)}
          >
            {searchOpen ? "Fermer" : "Chercher"}
          </button>

          <p className="hidden text-xs text-tdev-muted lg:block">
            {unread > 0 ? `${unread} alerte(s)` : "Opérationnel"}
          </p>
          <span className="hidden rounded-none bg-tdev-surface px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] sm:inline">
            {user?.role ?? "…"}
          </span>
          {unread > 0 ? (
            <span
              className="inline-flex size-2 shrink-0 rounded-full bg-tdev-orange lg:hidden"
              aria-label={`${unread} alertes`}
            />
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 px-2 sm:px-3"
            onClick={() => void logout()}
          >
            <span className="sm:hidden">Out</span>
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {searchOpen ? (
          <form onSubmit={search} className="border-t border-tdev-border px-3 py-3 md:hidden">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Commande, client, SKU…"
              className="h-11 w-full border border-tdev-anthracite bg-tdev-white px-3 text-sm"
            />
          </form>
        ) : null}
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-tdev-anthracite/55"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            id="admin-mobile-nav"
            className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-tdev-anthracite bg-tdev-white pt-[env(safe-area-inset-top)] shadow-[8px_0_24px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-center justify-between border-b border-tdev-border px-4 py-3">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]">
                Navigation
              </p>
              <button
                type="button"
                className="border border-tdev-anthracite px-2 py-1 text-[11px] font-extrabold uppercase"
                onClick={() => setMenuOpen(false)}
              >
                Fermer
              </button>
            </div>
            {user ? (
              <div className="border-b border-tdev-border px-4 py-3">
                <p className="text-sm font-bold">{user.fullName}</p>
                <p className="text-xs text-tdev-muted">{user.email}</p>
                <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.08em]">
                  {user.role}
                  {unread > 0 ? ` · ${unread} alerte(s)` : ""}
                </p>
              </div>
            ) : null}
            <AdminNavLinks
              links={links}
              pathname={pathname}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden border-r border-tdev-anthracite bg-tdev-white lg:block lg:min-h-[calc(100dvh-4rem)]">
          <AdminNavLinks links={links} pathname={pathname} />
        </aside>
        <main className="motion-enter min-w-0 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
