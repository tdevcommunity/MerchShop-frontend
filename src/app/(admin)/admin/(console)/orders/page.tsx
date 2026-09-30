"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminAction } from "@/features/admin/components/admin-action";
import { AdminState } from "@/features/admin/components/admin-state";
import { OrderDetailModal } from "@/features/admin/components/order-detail-modal";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest } from "@/features/admin/services/admin-client";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/features/admin/labels";
import { formatMoney } from "@/lib/utils/format-money";
import { ORDER_STATUSES } from "@/types/order";
import type { AdminOrder } from "@/types/admin";
import { PAYMENT_STATUSES } from "@/types/payment";

type OrdersResponse = {
  items: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
};

const DELIVERY_LABELS: Record<string, string> = {
  pickup_event: "Retrait",
  delivery: "Livraison",
};

function AdminOrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get("order");

  const [data, setData] = useState<OrdersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const [product, setProduct] = useState("");
  const [page, setPage] = useState(1);

  const setSelectedOrderId = useCallback(
    (orderId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (orderId) {
        params.set("order", orderId);
      } else {
        params.delete("order");
      }
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
    });
    if (query.trim()) params.set("q", query.trim());
    if (status) params.set("status", status);
    if (payment) params.set("payment", payment);
    if (fulfillment) params.set("fulfillment", fulfillment);
    if (product.trim()) params.set("product", product.trim());
    void adminRequest<OrdersResponse>(`/api/admin/orders?${params}`)
      .then(setData)
      .catch((loadError: Error) => setError(loadError.message));
  }, [page, query, status, payment, fulfillment, product]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function refreshListOrder(order: AdminOrder) {
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) => (item.id === order.id ? order : item)),
          }
        : current,
    );
  }

  return (
    <div>
      <PageHeader
        title="Commandes"
        description="Filtres et pagination serveur — le détail s'ouvre en popup."
      />
      <div className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <input
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
          placeholder="Référence, client, email…"
          className="h-11 border border-tdev-anthracite px-3 text-sm"
        />
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className="h-11 border border-tdev-anthracite px-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {ORDER_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
        <select
          value={payment}
          onChange={(event) => {
            setPage(1);
            setPayment(event.target.value);
          }}
          className="h-11 border border-tdev-anthracite px-2 text-sm"
        >
          <option value="">Tous les paiements</option>
          {PAYMENT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {PAYMENT_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
        <select
          value={fulfillment}
          onChange={(event) => {
            setPage(1);
            setFulfillment(event.target.value);
          }}
          className="h-11 border border-tdev-anthracite px-2 text-sm"
        >
          <option value="">Retrait / livraison</option>
          <option value="pickup_event">Retrait</option>
          <option value="delivery">Livraison</option>
        </select>
        <input
          value={product}
          onChange={(event) => {
            setPage(1);
            setProduct(event.target.value);
          }}
          placeholder="Produit"
          className="h-11 border border-tdev-anthracite px-3 text-sm"
        />
      </div>
      <AdminState
        loading={!data && !error}
        error={error}
        empty={Boolean(data) && data?.items.length === 0}
        emptyTitle="Aucune commande"
        emptyHint="Dès qu'un achat est payé dans le Shop, il apparaît ici."
      />
      {data && data.items.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
                <tr>
                  <th className="p-3">Commande</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Paiement</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">QR</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((order) => (
                  <tr key={order.id} className="border-t border-tdev-border">
                    <td className="p-3 font-medium">{order.reference}</td>
                    <td className="p-3">
                      {order.customer.firstName} {order.customer.lastName}
                    </td>
                    <td className="p-3 text-tdev-muted">{order.createdAt.slice(0, 10)}</td>
                    <td className="p-3">{formatMoney(order.total)}</td>
                    <td className="p-3">
                      <StatusBadge value={order.paymentStatus} />
                    </td>
                    <td className="p-3">
                      {DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}
                    </td>
                    <td className="p-3">
                      <StatusBadge value={order.status} />
                    </td>
                    <td className="p-3">{order.status === "awaiting_payment" ? "—" : "Prêt"}</td>
                    <td className="p-3">
                      <AdminAction tone="brand" onClick={() => setSelectedOrderId(order.id)}>
                        Détail
                      </AdminAction>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-tdev-muted">
              {data.total} commande(s) · page {data.page}/{pages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="border border-tdev-anthracite px-3 py-1 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Précédent
              </button>
              <button
                type="button"
                className="border border-tdev-anthracite px-3 py-1 disabled:opacity-40"
                disabled={page >= pages}
                onClick={() => setPage((current) => current + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      ) : null}

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onUpdated={refreshListOrder}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-tdev-muted">Chargement des commandes…</p>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
