"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/features/admin/components/page-header";
import { adminRequest } from "@/features/admin/services/admin-client";
import { formatMoney } from "@/lib/utils/format-money";
import type { DashboardSnapshot } from "@/types/admin";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminRequest<DashboardSnapshot>("/api/admin/dashboard")
      .then(setData)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  if (error) {
    return <p className="text-tdev-orange">{error}</p>;
  }
  if (!data) {
    return <p className="text-sm text-tdev-muted">Chargement du tableau de bord…</p>;
  }

  const kpis = [
    { label: "Chiffre d'affaires", value: formatMoney(data.revenue) },
    { label: "Commandes", value: String(data.orders) },
    { label: "Payées", value: String(data.paidOrders) },
    { label: "En attente", value: String(data.pendingOrders) },
    { label: "À retirer", value: String(data.readyForPickup) },
    { label: "Retirées", value: String(data.pickedUp) },
    { label: "Produits actifs", value: String(data.activeProducts) },
    { label: "Stock faible", value: String(data.lowStockProducts) },
  ];
  const maxSale = Math.max(...data.salesByDay.map((day) => day.amount), 1);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Activité réelle du Shop, recalculée depuis les commandes et le catalogue."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="border border-tdev-anthracite bg-tdev-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-tdev-muted">
              {kpi.label}
            </p>
            <p className="mt-2 font-headline text-2xl font-extrabold">{kpi.value}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="border border-tdev-anthracite bg-tdev-white p-5">
          <h2 className="font-headline text-lg font-extrabold uppercase">Ventes 7 jours</h2>
          <div className="mt-4 flex h-40 items-end gap-2">
            {data.salesByDay.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full bg-tdev-blue"
                  style={{ height: `${Math.max(8, (day.amount / maxSale) * 100)}%` }}
                />
                <span className="text-[10px] text-tdev-muted">{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="border border-tdev-anthracite bg-tdev-white p-5">
          <h2 className="font-headline text-lg font-extrabold uppercase">Top produits</h2>
          {data.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-tdev-muted">Aucune vente enregistrée pour l&apos;instant.</p>
          ) : (
            <ul className="mt-4 divide-y divide-tdev-border">
              {data.topProducts.map((product) => (
                <li key={product.name} className="flex justify-between py-2 text-sm">
                  <span>{product.name}</span>
                  <span className="font-bold">
                    {product.quantity} · {formatMoney(product.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="mt-6 border border-tdev-anthracite bg-tdev-white p-5">
        <h2 className="font-headline text-lg font-extrabold uppercase">Alertes stock</h2>
        {data.lowStock.length === 0 ? (
          <p className="mt-4 text-sm text-tdev-muted">Aucun produit proche de la rupture.</p>
        ) : (
          <ul className="mt-4 divide-y divide-tdev-border text-sm">
            {data.lowStock.map((row) => (
              <li key={row.sku} className="flex justify-between py-2">
                <span>
                  {row.productName} · {row.sku}
                </span>
                <span className="font-bold text-tdev-orange">
                  {row.stock} / seuil {row.threshold}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
