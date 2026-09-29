"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { buttonClassName } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { analyticsEvents } from "@/features/analytics/events";
import { track } from "@/features/analytics/track";
import { getOrderById } from "@/features/order/services/order-service";
import { getPickupQr } from "@/features/qr/services/qr-service";
import { PickupQrCard } from "@/features/qr/components/pickup-qr-card";
import { isNotFoundError, toUserMessage } from "@/lib/api/errors";
import { formatMoney } from "@/lib/utils/format-money";
import { DELIVERY_METHODS } from "@/types/delivery";
import type { Order } from "@/types/order";
import type { PickupQr } from "@/types/qr";

type OrderConfirmationProps = {
  orderId: string;
};

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [qr, setQr] = useState<PickupQr | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextOrder = await getOrderById(orderId);
        const nextQr = await getPickupQr(orderId);
        if (cancelled) {
          return;
        }
        setOrder(nextOrder);
        setQr(nextQr);
        track(analyticsEvents.qrDisplayed, { orderId });
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        if (isNotFoundError(loadError)) {
          setNotFound(true);
        } else {
          setError(toUserMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner label="Chargement de la commande" />
      </div>
    );
  }

  if (notFound) {
    return (
      <ErrorState
        title="Commande introuvable"
        description="Cette commande n'existe pas, a expiré, ou n'est pas accessible depuis ce navigateur."
      />
    );
  }

  if (error || !order) {
    return (
      <ErrorState
        title="Impossible de charger la commande"
        description={error ?? "Erreur inconnue."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Alert title="Paiement confirmé côté Shop (mock)" tone="success">
        Référence {order.reference}. Le statut réel restera celui renvoyé par le
        backend.
      </Alert>

      <Card>
        <h2 className="font-headline text-lg text-tdev-white">Articles</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-white/80">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.variantId}`}>
              {item.quantity} × {item.productName} ({item.variantLabel}) —{" "}
              {formatMoney(item.unitPrice * item.quantity)}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-medium text-tdev-yellow">
          Total {formatMoney(order.total)}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {order.deliveryMethod === DELIVERY_METHODS.PICKUP_EVENT
            ? order.pickupLabel ?? "Retrait Jour J"
            : "Livraison"}
        </p>
      </Card>

      {qr ? <PickupQrCard qr={qr} /> : null}

      <Link href={`/order/${order.id}`} className={buttonClassName("secondary")}>
        Voir le détail de la commande
      </Link>
    </div>
  );
}
