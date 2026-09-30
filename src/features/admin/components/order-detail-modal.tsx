"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminModal } from "@/features/admin/components/admin-modal";
import { AdminState } from "@/features/admin/components/admin-state";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { ORDER_STATUS_LABELS } from "@/features/admin/labels";
import { adminRequest } from "@/features/admin/services/admin-client";
import { formatMoney } from "@/lib/utils/format-money";
import { ORDER_TRANSITIONS, type AdminOrder } from "@/types/admin";
import type { OrderStatus } from "@/types/order";
import type { PickupQr } from "@/types/qr";

type OrderDetail = {
  order: AdminOrder;
  qr: PickupQr | null;
};

type OrderDetailModalProps = {
  orderId: string | null;
  onClose: () => void;
  onUpdated?: (order: AdminOrder) => void;
};

const DELIVERY_LABELS: Record<string, string> = {
  pickup_event: "Retrait sur site",
  delivery: "Livraison",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mobile_money: "Mobile Money",
  card: "Carte",
};

export function OrderDetailModal({
  orderId,
  onClose,
  onUpdated,
}: OrderDetailModalProps) {
  const [data, setData] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setData(null);
      setError(null);
      return;
    }
    setData(null);
    setError(null);
    void adminRequest<OrderDetail>(`/api/admin/orders/${orderId}`)
      .then(setData)
      .catch((loadError: Error) => setError(loadError.message));
  }, [orderId]);

  async function changeStatus(status: OrderStatus) {
    if (!orderId) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const order = await adminRequest<AdminOrder>(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: { status },
      });
      setData((current) => (current ? { ...current, order } : { order, qr: null }));
      onUpdated?.(order);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Transition interdite.");
    } finally {
      setBusy(false);
    }
  }

  const nextStatuses = data ? ORDER_TRANSITIONS[data.order.status] : [];

  return (
    <AdminModal
      open={Boolean(orderId)}
      title={data?.order.reference ?? "Commande"}
      description="Le frontend affiche le QR. La signature reste côté backend / Scan 3B."
      onClose={onClose}
    >
      <AdminState loading={Boolean(orderId) && !data && !error} error={error} />
      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h3 className="font-headline text-sm font-extrabold uppercase">Client</h3>
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
                <dd>{data.order.customer.email || "—"}</dd>
              </div>
            </dl>
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h3 className="font-headline text-sm font-extrabold uppercase">Commande</h3>
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
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h3 className="font-headline text-sm font-extrabold uppercase">Paiement</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-tdev-muted">Méthode</dt>
                <dd>
                  {data.order.paymentMethod
                    ? PAYMENT_METHOD_LABELS[data.order.paymentMethod] ?? data.order.paymentMethod
                    : "—"}
                </dd>
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
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h3 className="font-headline text-sm font-extrabold uppercase">Livraison / retrait</h3>
            <p className="mt-3 text-sm">
              {DELIVERY_LABELS[data.order.deliveryMethod] ?? data.order.deliveryMethod}
            </p>
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
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h3 className="font-headline text-sm font-extrabold uppercase">QR de retrait</h3>
            {data.qr ? (
              <div className="mt-3">
                <StatusBadge value={data.qr.status} />
                {data.qr.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.qr.imageUrl} alt={data.qr.alt} className="mt-3 size-40 border" />
                ) : (
                  <p className="mt-3 text-sm text-tdev-muted">
                    QR généré côté backend pour {data.order.reference}. Affichage uniquement.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-tdev-muted">Pas encore de QR pour cette commande.</p>
            )}
          </section>
          <section className="border border-tdev-anthracite bg-tdev-white p-4">
            <h3 className="font-headline text-sm font-extrabold uppercase">Transitions</h3>
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
                    {ORDER_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </AdminModal>
  );
}
