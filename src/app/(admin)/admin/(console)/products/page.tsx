"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest } from "@/features/admin/services/admin-client";
import { formatMoney } from "@/lib/utils/format-money";
import type { AdminProduct } from "@/types/admin";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void adminRequest<AdminProduct[]>("/api/admin/products")
      .then(setProducts)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  async function load() {
    setProducts(await adminRequest<AdminProduct[]>("/api/admin/products"));
  }

  const rows = useMemo(() => {
    const list = products ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter((product) =>
      [product.name, product.slug, product.category, ...product.variants.map((variant) => variant.sku)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [products, query]);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      await adminRequest(`/api/admin/products/${id}`, { method: "PATCH", body });
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action impossible.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Produits"
        description="Le catalogue publié alimente directement le Shop public."
        actions={
          <Link href="/admin/products/new">
            <Button variant="brand">Nouveau produit</Button>
          </Link>
        }
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher un produit ou un SKU"
        className="mb-4 h-11 w-full max-w-md border border-tdev-anthracite px-3 text-sm"
      />
      <AdminState
        loading={!products && !error}
        error={error}
        empty={Boolean(products) && rows.length === 0}
        emptyTitle="Aucun produit"
        emptyHint="Créez votre premier produit pour commencer à alimenter le Shop."
      />
      {products && rows.length > 0 ? (
        <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Nom</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Prix</th>
                <th className="p-3">Variantes</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Créé</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => {
                const stock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
                const price = Math.min(...product.variants.map((variant) => variant.unitPrice));
                return (
                  <tr key={product.id} className="border-t border-tdev-border">
                    <td className="p-3">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt="" className="size-12 object-cover" />
                      ) : (
                        <span className="block size-12 bg-tdev-surface" />
                      )}
                    </td>
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">{formatMoney(price)}</td>
                    <td className="p-3">{product.variants.length}</td>
                    <td className="p-3">{stock}</td>
                    <td className="p-3">
                      <StatusBadge value={product.status} />
                    </td>
                    <td className="p-3 text-tdev-muted">{product.createdAt.slice(0, 10)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        <Link href={`/admin/products/${product.id}`} className="text-xs font-bold underline">
                          Voir
                        </Link>
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          className="text-xs font-bold underline"
                          onClick={() => void patch(product.id, { duplicate: true })}
                        >
                          Dupliquer
                        </button>
                        {product.status === "published" ? (
                          <button
                            type="button"
                            disabled={busyId === product.id}
                            className="text-xs font-bold underline"
                            onClick={() => void patch(product.id, { status: "draft" })}
                          >
                            Dépublier
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busyId === product.id}
                            className="text-xs font-bold underline"
                            onClick={() => void patch(product.id, { status: "published" })}
                          >
                            Publier
                          </button>
                        )}
                        {product.status !== "archived" ? (
                          <button
                            type="button"
                            disabled={busyId === product.id}
                            className="text-xs font-bold underline text-tdev-orange"
                            onClick={() => {
                              if (window.confirm(`Archiver « ${product.name} » ?`)) {
                                void patch(product.id, { status: "archived" });
                              }
                            }}
                          >
                            Archiver
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
