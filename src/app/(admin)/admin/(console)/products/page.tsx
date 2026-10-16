"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminAction, AdminActionLink } from "@/features/admin/components/admin-action";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { formatAdminDate } from "@/features/admin/labels";
import { adminRequest } from "@/features/admin/services/admin-client";
import { formatMoney } from "@/lib/utils/format-money";
import type { AdminProduct } from "@/types/admin";

type ProductsResponse = {
  items: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (query.trim()) params.set("q", query.trim());
    void adminRequest<ProductsResponse>(`/api/admin/products?${params}`)
      .then(setData)
      .catch((loadError: Error) => setError(loadError.message));
  }, [page, query]);

  async function load() {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (query.trim()) params.set("q", query.trim());
    setData(await adminRequest<ProductsResponse>(`/api/admin/products?${params}`));
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const updated = await adminRequest<AdminProduct>(`/api/admin/products/${id}`, {
        method: "PATCH",
        body,
      });
      if (body.duplicate) {
        await load();
        return;
      }
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((product) => (product.id === id ? updated : product)),
            }
          : current,
      );
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
          <Link href="/admin/products/new" className="w-full sm:w-auto">
            <Button variant="brand" className="w-full sm:w-auto">
              Nouveau produit
            </Button>
          </Link>
        }
      />
      <input
        value={query}
        onChange={(event) => {
          setPage(1);
          setQuery(event.target.value);
        }}
        placeholder="Rechercher un produit ou un SKU"
        className="mb-4 h-11 w-full max-w-md border border-tdev-anthracite px-3 text-sm"
      />
      <AdminState
        loading={!data && !error}
        error={error}
        empty={Boolean(data) && data?.items.length === 0}
        emptyTitle="Aucun produit"
        emptyHint="Créez votre premier produit pour commencer à alimenter le Shop."
      />
      {data && data.items.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
                <tr>
                  <th className="p-3">Photo</th>
                  <th className="p-3">Produit</th>
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
                {data.items.map((product, index) => {
                  const rawCategory = product.category;
                  const category =
                    rawCategory &&
                    typeof rawCategory === "object" &&
                    "name" in rawCategory
                      ? String((rawCategory as { name: unknown }).name)
                      : product.categoryLabel || "";
                  const stock = product.variants.reduce(
                    (sum, v) => sum + (Number(v.stockQuantity) || 0),
                    0,
                  );
                  const price =
                    product.variants.length > 0
                      ? Math.min(...product.variants.map((v) => Number(v.unitPrice) || 0))
                      : 0;
                  return (
                    <tr
                      key={product.id || product.slug || String(index)}
                      className="border-t border-tdev-border"
                    >
                      <td className="p-3">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt="" className="size-12 object-cover" />
                        ) : (
                          <span className="block size-12 bg-tdev-surface" />
                        )}
                      </td>
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3">{category}</td>
                      <td className="p-3">{formatMoney(price)}</td>
                      <td className="p-3">{product.variants.length}</td>
                      <td className="p-3">{stock}</td>
                      <td className="p-3">
                        <StatusBadge value={product.status} />
                      </td>
                      <td className="p-3 text-tdev-muted">
                        {formatAdminDate(product.createdAt, 10)}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          <AdminActionLink href={`/admin/products/${product.id}`} tone="brand">
                            Modifier
                          </AdminActionLink>
                          <AdminAction
                            disabled={!product.id || busyId === product.id}
                            onClick={() => void patch(product.id, { duplicate: true })}
                          >
                            Dupliquer
                          </AdminAction>
                          {product.status === "published" ? (
                            <AdminAction
                              disabled={!product.id || busyId === product.id}
                              onClick={() => void patch(product.id, { status: "draft" })}
                            >
                              Dépublier
                            </AdminAction>
                          ) : (
                            <AdminAction
                              tone="success"
                              disabled={!product.id || busyId === product.id}
                              onClick={() => void patch(product.id, { status: "published" })}
                            >
                              Publier
                            </AdminAction>
                          )}
                          {product.status !== "archived" ? (
                            <AdminAction
                              tone="danger"
                              disabled={!product.id || busyId === product.id}
                              onClick={() => {
                                if (window.confirm(`Archiver « ${product.name} » ?`)) {
                                  void patch(product.id, { status: "archived" });
                                }
                              }}
                            >
                              Archiver
                            </AdminAction>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-tdev-muted">
              {data.total} produit(s) — page {data.page} / {Math.max(1, Math.ceil(data.total / data.pageSize))}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="border border-tdev-anthracite px-3 py-1 text-sm disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Précédent
              </button>
              <button
                type="button"
                className="border border-tdev-anthracite px-3 py-1 text-sm disabled:opacity-40"
                disabled={page >= Math.max(1, Math.ceil(data.total / data.pageSize))}
                onClick={() => setPage((current) => current + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
