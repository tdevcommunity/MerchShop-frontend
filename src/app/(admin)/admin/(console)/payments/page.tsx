"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest } from "@/features/admin/services/admin-client";
import { formatMoney } from "@/lib/utils/format-money";
import type { AdminPayment } from "@/types/admin";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void adminRequest<AdminPayment[]>("/api/admin/payments")
      .then(setPayments)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  const rows = useMemo(() => {
    const list = payments ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter((payment) =>
      [payment.id, payment.orderId, payment.providerRef, payment.customerName]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [payments, query]);

  return (
    <div>
      <PageHeader
        title="Paiements"
        description="Statuts issus du backend. L'admin n'invente pas une transaction réussie."
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Transaction, commande, client…"
        className="mb-4 h-11 w-full max-w-md border border-tdev-anthracite px-3 text-sm"
      />
      <AdminState
        loading={!payments && !error}
        error={error}
        empty={Boolean(payments) && rows.length === 0}
        emptyTitle="Aucun paiement"
        emptyHint="Les webhooks et le checkout mocké alimentent cette liste."
      />
      {payments && rows.length > 0 ? (
        <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-3">Transaction</th>
                <th className="p-3">Commande</th>
                <th className="p-3">Client</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Méthode</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((payment) => (
                <tr key={payment.id} className="border-t border-tdev-border">
                  <td className="p-3 font-medium">{payment.providerRef ?? payment.id}</td>
                  <td className="p-3">
                  <Link href={`/admin/orders?order=${payment.orderId}`} className="underline">
                    {payment.orderId}
                  </Link>
                  </td>
                  <td className="p-3">{payment.customerName}</td>
                  <td className="p-3">{formatMoney(payment.amount)}</td>
                  <td className="p-3">{payment.method ?? "—"}</td>
                  <td className="p-3">
                    <StatusBadge value={payment.status} />
                  </td>
                  <td className="p-3 text-tdev-muted">{payment.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
