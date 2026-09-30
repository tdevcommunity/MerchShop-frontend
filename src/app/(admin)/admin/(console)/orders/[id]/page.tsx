"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminState } from "@/features/admin/components/admin-state";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { adminRequest } from "@/features/admin/services/admin-client";
import { formatMoney } from "@/lib/utils/format-money";
import { ORDER_TRANSITIONS, type AdminOrder } from "@/types/admin";
import type { OrderStatus } from "@/types/order";
import type { PickupQr } from "@/types/qr";

type OrderDetail = {
  order: AdminOrder;
  qr: PickupQr | null;
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void adminRequest<OrderDetail>(`/api/admin/orders/${id}`)
      .then(setData)
      .catch((loadError: Error) => setError(loadError.message));
  }, [id]);

  async function load() {
    setData(await adminRequest<OrderDetail>(`/api/admin/orders/${id}`));
  }

  async function changeStatus(status: OrderStatus) {
    setBusy(true);
    setError(null);
    try {
      await adminRequest(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
      await load();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Transition interdite.");
    } finally {
      setBusy(false);
    }
  }

  const nextStatuses = data ? ORDER_TRANSITIONS[data.order.status] : [];

  return (
    <div>
      <PageHeader
        title={data?.order.reference ?? "Commande"}
        description="Le frontend affiche le QR. La signature reste côté backend / Scan 3B."
      />
      <AdminState loading={!data && !error} error={error} />
      {data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Client</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-tdev-muted">Nom</dt>
                <dd>
                  {data.order.customer.firstName} {data.order.customer.lastName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tdev-muted">Téléphone</dt>
                <dd>{data.order.customer.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-tdev-muted">Email</dt>
                <dd>{data.order.customer.email}</dd>
              </div>
            </dl>
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Commande</h2>
            <p className="mt-2 text-sm text-tdev-muted">
              {data.order.id} · {data.order.createdAt.slice(0, 16).replace("T", " ")}
            </p>
            <ul className="mt-3 divide-y divide-tdev-border text-sm">
              {data.order.items.map((item) => (
                <li key={`${item.variantId}-${item.productId}`} className="flex justify-between py-2">
                  <span>
                    {item.productName} · {item.variantLabel} × {item.quantity}
                  </span>
                  <span>{formatMoney(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-headline text-xl font-extrabold">
              Total {formatMoney(data.order.total)}
            </p>
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Paiement</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-tdev-muted">Méthode</dt>
                <dd>{data.order.paymentMethod ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-tdev-muted">Statut</dt>
                <dd>
                  <StatusBadge value={data.order.paymentStatus} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-tdev-muted">Montant</dt>
                <dd>{formatMoney(data.order.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-tdev-muted">
              L&apos;état vient du backend / webhook. L&apos;admin ne recalcule pas la validité.
            </p>
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Livraison / retrait</h2>
            <p className="mt-3 text-sm">{data.order.deliveryMethod}</p>
            <p className="mt-1 text-sm text-tdev-muted">{data.order.pickupLabel ?? "—"}</p>
            {data.order.shippingAddress ? (
              <p className="mt-2 text-sm">
                {data.order.shippingAddress.line1}, {data.order.shippingAddress.city}
              </p>
            ) : null}
            <p className="mt-3">
              <StatusBadge value={data.order.status} />
            </p>
            {data.order.pickupAgentEmail ? (
              <p className="mt-2 text-xs text-tdev-muted">
                Retiré par {data.order.pickupAgentEmail} le{" "}
                {data.order.pickupValidatedAt?.slice(0, 16).replace("T", " ")}
              </p>
            ) : null}
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">QR de retrait</h2>
            {data.qr ? (
              <div className="mt-3">
                <StatusBadge value={data.qr.status} />
                {data.qr.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.qr.imageUrl} alt={data.qr.alt} className="mt-3 size-40 border" />
                ) : (
                  <p className="mt-3 text-sm text-tdev-muted">
                    QR généré côté backend pour {data.order.reference}. Affichage uniquement — pas de
                    signature locale.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-tdev-muted">Pas encore de QR pour cette commande.</p>
            )}
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-5">
            <h2 className="font-headline text-lg font-extrabold uppercase">Transitions</h2>
            {nextStatuses.length === 0 ? (
              <p className="mt-3 text-sm text-tdev-muted">Aucun changement autorisé depuis cet état.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void changeStatus(status)}
                  >
                    {status.replaceAll("_", " ")}
                  </Button>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
