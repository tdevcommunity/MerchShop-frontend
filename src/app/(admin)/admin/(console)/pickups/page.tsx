"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest, adminList } from "@/features/admin/services/admin-client";
import type { AdminPickup } from "@/types/admin";

export default function AdminPickupsPage() {
  const [rows, setRows] = useState<AdminPickup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void adminList<AdminPickup>("/api/admin/pickups")
      .then(setRows)
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  async function load() {
    setRows(await adminList<AdminPickup>("/api/admin/pickups"));
  }

  const filtered = useMemo(() => {
    const list = rows ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(({ order }) =>
      [
        order.id,
        order.reference,
        order.customer.firstName,
        order.customer.lastName,
        order.customer.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  async function validate(orderId: string) {
    setBusyId(orderId);
    setError(null);
    try {
      await adminRequest(`/api/admin/pickups/${orderId}/validate`, { method: "POST" });
      await load();
    } catch (validateError) {
      setError(validateError instanceof Error ? validateError.message : "Retrait impossible.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Retraits"
        description="Interface stand : retrouver une commande et valider le QR présenté."
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Order ID, client, téléphone…"
        className="mb-4 h-11 w-full max-w-md border border-tdev-anthracite px-3 text-sm"
      />
      <AdminState
        loading={!rows && !error}
        error={error}
        empty={Boolean(rows) && filtered.length === 0}
        emptyTitle="Aucun retrait"
        emptyHint="Les commandes payées apparaissent ici pour le staff sur place."
      />
      {rows && filtered.length > 0 ? (
        <div className="overflow-x-auto border border-tdev-anthracite bg-tdev-white">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-tdev-surface text-[11px] font-extrabold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-3">Commande</th>
                <th className="p-3">Client</th>
                <th className="p-3">Articles</th>
                <th className="p-3">Statut</th>
                <th className="p-3">QR</th>
                <th className="p-3">Date</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ order, qr }) => (
                <tr key={order.id} className="border-t border-tdev-border">
                  <td className="p-3 font-medium">{order.reference}</td>
                  <td className="p-3">
                    {order.customer.firstName} {order.customer.lastName}
                    <span className="block text-xs text-tdev-muted">{order.customer.phone}</span>
                  </td>
                  <td className="p-3">
                    {order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}
                  </td>
                  <td className="p-3">
                    <StatusBadge value={order.status} />
                  </td>
                  <td className="p-3">{qr?.status ?? "—"}</td>
                  <td className="p-3 text-tdev-muted">{order.createdAt.slice(0, 10)}</td>
                  <td className="p-3">{order.pickupAgentEmail ?? "—"}</td>
                  <td className="p-3">
                    {order.status === "picked_up" || order.status === "completed" ? (
                      <span className="text-xs text-tdev-muted">Déjà retiré</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="brand"
                        disabled={busyId === order.id}
                        onClick={() => {
                          if (window.confirm(`Valider le retrait de ${order.reference} ?`)) {
                            void validate(order.id);
                          }
                        }}
                      >
                        Valider le retrait
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
