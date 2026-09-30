"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { adminRequest } from "@/features/admin/services/admin-client";
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
  { href: "/admin/settings", label: "Paramètres", roles: ["admin"] },
];

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<AdminNotification[]>([]);

  useEffect(() => {
    void adminRequest<AdminSessionUser>("/api/admin/me")
      .then(setUser)
      .catch(() => router.replace("/admin/login"));
    void adminRequest<AdminNotification[]>("/api/admin/notifications").then(setNotes);
  }, [router]);

  async function logout() {
    await adminRequest("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function search(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) {
      return;
    }
    router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
  }

  const unread = notes.filter((note) => !note.read).length;
  const links = NAV.filter((item) => !user || item.roles.includes(user.role));

  return (
    <div className="min-h-dvh bg-tdev-surface text-tdev-anthracite">
      <header className="sticky top-0 z-20 border-b border-tdev-anthracite bg-tdev-white">
        <div className="flex h-14 items-center gap-3 px-4 lg:h-16 lg:px-6">
          <button
            type="button"
            className="border border-tdev-anthracite px-3 py-2 text-xs font-bold uppercase lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
          <Link href="/admin/dashboard">
            <BrandMark />
          </Link>
          <span className="hidden font-headline text-xs font-extrabold uppercase tracking-[0.16em] text-tdev-muted lg:inline">
            Admin Shop
          </span>
          <form onSubmit={search} className="ml-auto flex-1 max-w-md">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Commande, client, SKU, produit…"
              className="h-10 w-full border border-tdev-anthracite bg-tdev-white px-3 text-sm"
            />
          </form>
          <p className="hidden text-xs text-tdev-muted lg:block">
            {unread > 0 ? `${unread} alerte(s)` : "Opérationnel"}
          </p>
          <p className="text-xs font-bold uppercase">{user?.role ?? "…"}</p>
          <Button size="sm" variant="ghost" onClick={() => void logout()}>
            Logout
          </Button>
        </div>
      </header>
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside
          className={cn(
            "border-b border-tdev-border bg-tdev-white lg:min-h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r lg:border-tdev-anthracite",
            menuOpen ? "block" : "hidden lg:block",
          )}
        >
          <nav className="flex flex-col p-3">
            {links.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-bold uppercase tracking-[0.08em]",
                    active
                      ? "bg-tdev-blue text-tdev-white"
                      : "hover:bg-tdev-surface",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="motion-enter min-w-0 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
