"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { adminRequest } from "@/features/admin/services/admin-client";
import { formatMoney } from "@/lib/utils/format-money";
import type { AdminOrder, AdminPayment, AdminProduct } from "@/types/admin";

type SearchResult = {
  products: AdminProduct[];
  orders: AdminOrder[];
  payments: AdminPayment[];
};

function SearchResults() {
  const query = useSearchParams().get("q") ?? "";
  const [data, setData] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    void adminRequest<SearchResult>(`/api/admin/search?q=${encodeURIComponent(query)}`)
      .then(setData)
      .catch((loadError: Error) => setError(loadError.message));
  }, [query]);

  const result =
    query.trim().length < 2 ? { products: [], orders: [], payments: [] } : data;
  const empty =
    Boolean(result) &&
    result!.products.length === 0 &&
    result!.orders.length === 0 &&
    result!.payments.length === 0;

  return (
    <div>
      <PageHeader
        title="Recherche"
        description={query ? `Résultats pour « ${query} »` : "Tape au moins 2 caractères dans l'en-tête."}
      />
      <AdminState
        loading={query.trim().length >= 2 && !data && !error}
        error={error}
        empty={empty}
        emptyTitle="Aucun résultat"
        emptyHint="Essaie une référence commande, un email, un SKU ou un nom produit."
      />
      {result && !empty ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h2 className="font-headline font-extrabold uppercase">Produits</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.products.map((product) => (
                <li key={product.id}>
                  <Link href={`/admin/products/${product.id}`} className="underline">
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h2 className="font-headline font-extrabold uppercase">Commandes</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.orders.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/orders/${order.id}`} className="underline">
                    {order.reference} · {order.customer.lastName}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h2 className="font-headline font-extrabold uppercase">Paiements</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.payments.map((payment) => (
                <li key={payment.id}>
                  {payment.providerRef} · {formatMoney(payment.amount)}
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminSearchPage() {
  return (
    <Suspense fallback={<p className="text-sm text-tdev-muted">Recherche…</p>}>
      <SearchResults />
    </Suspense>
  );
}
